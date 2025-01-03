<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Expense;
use App\Models\Customer;
use App\Models\OrderDetail;
use App\Models\ProductSize;
use App\Models\JarTracker;
use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $invoiceType = $request->query('invoiceType');
        if($invoiceType > -1){
            $orderStatus = $request->query('orderStatus');
            if($orderStatus > -1){
                $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])
                ->where('company_id', $user->company_id)
                ->where('invoiceType',$invoiceType)
                ->where('orderStatus',$orderStatus)
                ->orderBy('id', 'desc')->paginate(25);
                return $orders;
            }
            $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $user->company_id)->where('invoiceType',$invoiceType)->orderBy('id', 'desc')->paginate(25);
            return $orders;
        }else{
            $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $user->company_id)->orderBy('id', 'desc')->paginate(25);
            return $orders;
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $profit = 0;
        foreach($request->items as $item){
            $profit += $item['total_price'] - (($item['dQty'] ?? 0) * ($item['bPrice'] ?? 0));
        }
        // Create order
        $order = Order::create(
            array_merge(
                $request->all(),
                [
                    'profit' => $profit,
                    'company_id' => $user->company_id,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]
            )
        );
        // Insert all items in Order details
        foreach($request->items as $item){
            $od = new OrderDetail;
            $od->product_id = $item['id'];
            $od->product_name = $item['name'];
            $od->product_local_name = $item['localName'];
            $od->product_unit = $item['unit'];
            $od->product_sizes_id = $item['product_sizes_id'];
            $od->size_name = $item['size_name'];
            $od->size_local_name = $item['size_local_name'];
            $od->dQty = $item['dQty'] ?? 0;
            $od->eQty = $item['eQty'] ?? 0;
            $od->oPrice = $item['oPrice'];
            $od->dPrice = $item['dPrice'];
            $od->total_price = $item['total_price'] ?? 0;
            $order->items()->save($od);
            //update stock of products
            if($request->orderStatus == 1){
                $productSize = ProductSize::find($item['product_sizes_id']);
                if($productSize){
                    $changeStockQty =  ($item['eQty'] ?? 0) - ($item['dQty'] ?? 0);
                    $productSize->update(['stock'=> $productSize->stock + $changeStockQty]);
                }
                //is product returnable
                
                //update jar tracker
                // if($returnable){
                //     $returnQty = ($item['dQty'] ?? 0) - ($item['eQty'] ?? 0);
                //     $jarTracker = JarTracker::where('customer_id', $request['customer_id'])->where('product_sizes_id', $item['product_sizes_id'])->first();
                //     if($jarTracker){
                //         $jarTracker->quantity += $returnQty;
                //         $jarTracker->save();
                //     }else{
                //         JarTracker::create([
                //             'product_name' => $item['name'],
                //             'product_sizes_id' => $item['product_sizes_id'],
                //             'product_local_name' => $item['localName'],
                //             'customer_id' => $request['customer_id'],
                //             'quantity' => $returnQty,
                //             'created_by' => $user->id,
                //             'updated_by' => $user->id,
                //             ]);
                //     }
                // }
            }
            //update booked stock of products
            if($order->orderStatus == 2){
                $productSize = ProductSize::find($item['product_sizes_id']);
                if($productSize){
                    $changeStockQty =  ($item['dQty'] ?? 0);
                    $productSize->update(['booked'=> $productSize->booked + $changeStockQty]);
                }
            }
        }

        $paymentDetails = PaymentTracker::firstOrNew(array('customer_id' => $request->customer_id));
        //Update balance amount of customer
        if($request->orderStatus == 1){
            //Delivery
            $balanceAmount = $request->totalAmount - $request->paidAmount;
            $paymentDetails->created_by = $user->id;
            $paymentDetails->updated_by = $user->id;
            $paymentDetails->amount -= $balanceAmount;
        
        }
        if($request->orderStatus !== 1 && $request->paidAmount > 0){
            $paymentDetails->amount += $request->paidAmount;
        }
        $paymentDetails->save();
        $order->items = $order->items()->get();
        return $order;
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::find($id);
        $order->items = $order->items()->get();
        $order->customer = Customer::find($order->customer_id);
        return $order;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $order = Order::find($id);
        if($order->orderStatus == $request->orderStatus){
            return response()->json([
                'success'=> false,
                'message' => 'Operation is alredy performed',
            ]);
        }
        //Cancele order
        if($order && $request->orderStatus == "0"){
            $order->items = $order->items()->get();
            //Cancel alredady delivered
            if($order->orderStatus == "1"){
                foreach($order->items as $item){
                    $productSize = ProductSize::find($item['product_sizes_id']);
                    if($productSize){
                        $productSize->update(['stock'=> $productSize->stock + $item['dQty']]);
                    }
                    //Update Customer Jar & payment tracker 
                    // $returnable = $productSize['returnable'];
                    // //update jar tracker
                    // if($returnable){
                    //     $returnQty = ($item['dQty'] ?? 0) - ($item['eQty'] ?? 0);
                    //     $jarTracker = JarTracker::where('customer_id', $order['customer_id'])->where('product_sizes_id', $productSize->id)->first();
                    //     if($jarTracker){
                    //         $jarTracker->quantity -= $returnQty;
                    //         $jarTracker->save();
                    //     }
                    // }
                }
                $paymentDetails = PaymentTracker::firstOrNew(array('customer_id' => $order->customer_id));
                $paymentDetails->amount += $order->totalAmount;
                $paymentDetails->save();
            }else{
                //Canceling booked (but not delivered) order
                foreach($order->items as $item){
                    $productSize = ProductSize::find($item['product_sizes_id']);
                    $productSize->update(['booked'=> $productSize->booked - $item['dQty']]);
                }
            }
        }
        //Advance booking is being marked as delivered
        if($order && $request->orderStatus == "1" && $order->orderStatus == "2" && $request->invoiceType == "2"){
            $order->items = $order->items()->get();
            foreach($order->items as $item){
                $productSize = ProductSize::find($item['product_sizes_id']);
                if($productSize){
                    $productSize->update(['stock'=> $productSize->stock - $item['dQty']]);
                    $productSize->update(['booked'=> $productSize->booked - $item['dQty']]);

                    //Update Customer Jar & payment tracker
                    //is product returnable
                    // $returnable = $productSize['returnable'];
                    // //update jar tracker
                    // if($returnable){
                    //     $returnQty = ($item['dQty'] ?? 0) - ($item['eQty'] ?? 0);
                    //     $jarTracker = JarTracker::where('customer_id', $order['customer_id'])->where('product_sizes_id', $productSize->id)->first();
                    //     if($jarTracker){
                    //         $jarTracker->quantity += $returnQty;
                    //         $jarTracker->save();
                    //     }else{
                    //         JarTracker::create([
                    //             'product_name' => $item['product_name'],
                    //             'product_local_name' => $item['product_local_name'],
                    //             'product_sizes_id' => $item['product_sizes_id'],
                    //             'customer_id' => $request['customer_id'],
                    //             'quantity' => $returnQty,
                    //             'created_by' => $user->id,
                    //             'updated_by' => $user->id,
                    //             ]);
                    //     }
                    // }
                }
                $paymentDetails = PaymentTracker::firstOrNew(array('customer_id' => $request->customer_id));
                $paymentDetails->amount -= $order->totalAmount;
                $paymentDetails->save();
            }
        }
        $order = Order::find($id);
        $order->update($request->all());
        return $order;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Order::destroy($id);
    }

    public function Sales(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        
        $query = Order::whereNotIn('orderStatus', [0, 2])
                    ->where('company_id', $user->company_id)
                       ->where('orderStatus',1) ;// Initial filter for orderStatus = 1
        
        if ($startDate && $endDate) {
            $query->whereBetween('invoiceDate', [$startDate, $endDate]);
        }
        
        $result = $query->get()->filter(function ($order) {
            return $order->orderStatus == 1; // Filter out any order with orderStatus other than 1
        });
        
        return response()->json($result);
    }


    public function totalDeliverie(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
    
        $query = Order::where('company_id', $user->company_id)
                       ->where('orderStatus',2) // Initial filter for orderStatus = 2 => Pending delivery
                       ->where('invoiceType',2) ;// Initial filter for invoicetype = 2 => advance booking
        
        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }
        
        $result = $query->get()->filter(function ($order) {
            return $order->orderStatus == 2; // Filter out any order with orderStatus other than 1
        });
        
        return response()->json($result);
    }
   
    /**
     * Get the monthly sales totals.
     *
     * @return \Illuminate\Http\Response
     */
    public function getMonthlyReport()
    {
        $user = Auth::user();
        // Fetch and process monthly expenses
        $monthlyExpense = Expense::select(
            DB::raw('SUM(total_price) as total_expense'),
            DB::raw('MONTH(expense_date) as month')
        )
        ->where('show', 1) // Only consider visible expenses
        ->where('company_id', $user->company_id)
        ->groupBy(DB::raw('MONTH(expense_date)'))
        ->get()
        ->keyBy('month')
        ->toArray();

        // Initialize an array with 12 zeros for expenses
        $expenseData = array_fill(0, 12, 0);

        // Fill in the expense data
        foreach ($monthlyExpense as $month => $data) {
            $expenseData[$month - 1] = $data['total_expense'];
        }    

        // Fetch and process monthly sales
        $monthlySales = Order::select(
            DB::raw('SUM(totalAmount) as total_sales'),
            DB::raw('MONTH(invoiceDate) as month')
        )
        ->where('company_id', $user->company_id)
        ->where('orderStatus', 1) // Only consider completed orders
        ->groupBy(DB::raw('MONTH(invoiceDate)'))
        ->get()
        ->keyBy('month')
        ->toArray();

        // Initialize an array with 12 zeros for sales
        $salesData = array_fill(0, 12, 0);

        // Fill in the sales data
        foreach ($monthlySales as $month => $data) {
            $salesData[$month - 1] = $data['total_sales'];
        }

        // Calculate the Profit and Loss (PL) data
        $PLdata = array_fill(0, 12, 0);
        foreach ($monthlySales as $month => $sales) {
            if (isset($monthlyExpense[$month])) {
                $expense = $monthlyExpense[$month];
                $PLdata[$month - 1] = $sales['total_sales'] - $expense['total_expense'];
            } else {
                $PLdata[$month - 1] = $sales['total_sales'];
            }
        }

        return response()->json([
            'success'=>true,
            'monthlySales' => $salesData,
            'monthlyExpense'=>$expenseData,
            'monthlyPandL'=>$PLdata,
        ]);
    }

    public function customerReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $id = $request->query('id');

        $user = Auth::user();
        $companyId = $user->company_id;
    
        $query = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $companyId)->where('orderStatus', 1);
        if($id > 0){
            $query->where('customer_id', $id);
        }
        
        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }
        
        $result = $query->get();
        return response()->json($result);
    }

    public function googleMapData(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
    
        $query = Order::with(['customer:id,name', 'user:id,name,mobile', 'items'])->where('orderStatus', 1);
        
        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }
        
        $result = $query->get();
        return response()->json($result);
    }

    /**
 * Update the return money for a specific order.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  int  $id
 * @return \Illuminate\Http\Response
 */
public function updateReturnMoney(Request $request, $id)
{
    $user = Auth::user();
    
    // Validate return amount
    $request->validate([
        'returnAmount' => 'required|numeric|min:0', // Ensure it's a positive number
    ]);

    // Find the order
    $order = Order::find($id);
    if (!$order) {
        return response()->json(['message' => 'Order not found.'], 404);
    }

    // Calculate the updated return money
    $returnAmount = $request->input('returnAmount');
    
    // Update return money field in the order
    $order->return_money = $returnAmount;
    
    // Update the total payment (reduce by the return amount)
    $order->totalAmount -= $returnAmount;

    // Save the updated order
    $order->save();

    // Update stock and payment tracker as necessary
    if ($order->orderStatus == 1) { // If the order is delivered
        foreach ($order->items as $item) {
            // Update product stock (if applicable)
            $productSize = ProductSize::find($item['product_sizes_id']);
            if ($productSize) {
                $productSize->update([
                    'stock' => $productSize->stock + ($item['dQty'] ?? 0),
                ]);
            }
        }

        // Update the payment tracker (if necessary)
        $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $order->customer_id]);
        $paymentDetails->amount += $returnAmount; // Adjust the amount based on the return
        $paymentDetails->save();
    }

    return response()->json([
        'message' => 'Return money updated successfully.',
        'order' => $order,
    ]);
}

}
