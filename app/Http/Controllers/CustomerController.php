<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\JarTracker;
use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user=Auth::user();
        $comapanyId = $user->company_id;
        $userType = $user->type;
        if($userType==0) {
            return Customer::all();
        }else{
            return Customer::where('company_id', $comapanyId)->get();
        }          
    }

    public function search(Request $request)
    {
        // Validate the input to ensure the 'searchQuery' field is a string
        $request->validate([
            'searchQuery' => 'required|string'
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        $searchQuery = $request->query('searchQuery'); // Use query method to get the query string

        if ($userType == 0) {
            // For admin or super user, return all customers matching the search pattern
            return Customer::where('name', 'LIKE', '%' . $searchQuery . '%')->get();
        } else {
            // For regular users, return customers of the company matching the search pattern
            return Customer::where('company_id', $companyId)
                ->where(function ($query) use ($searchQuery) {
                    $query->where('name', 'LIKE', '%' . $searchQuery . '%')
                          ->orWhere('mobile', 'LIKE', '%' . $searchQuery . '%');
                })->get();
        }
    }

    public function history(Request $request)
    {
        // Validate the input to ensure the 'searchQuery' field is a string
        $request->validate([
            'id' => 'required|string'
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        $id = $request->query('id'); 
        $returnEmptyProducts = JarTracker::where('customer_id', $id)->get();
        $paymentTrackerSum = PaymentTracker::where('customer_id', $id)->sum('amount'); // Assuming there is an 'amount' column

        return response()->json([
            'returnEmptyProducts' => $returnEmptyProducts,
            'pendingPayment' => $paymentTrackerSum * -1
        ]);
    }

    public function creditReport(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id; // Get the company_id of the authenticated user

        // Eager load PaymentTracker and JarTracker relationships
        $customers = Customer::with(['paymentTracker', 'jarTrackers'])
        ->where('company_id', $companyId)
        ->get();

        $creditReports = [];

        foreach ($customers as $customer) {
            if ($customer->paymentTracker) {
                $customerData = [
                    'name' => $customer->name,
                    'mobile' => $customer->mobile,
                    'address' => $customer->address,
                    'totalPayment' => $customer->paymentTracker->amount,
                    'items' => $customer->jarTrackers // All items from JarTracker
                ];

                $creditReports[] = $customerData;
            }
        }

        return response()->json($creditReports);
    }

    public function resetAllPayments()
    {
        $user = Auth::user();
        // Get all distinct customer IDs
        $distinctCustomerIds = PaymentTracker::distinct('customer_id')->pluck('customer_id');

        // Initialize an array to hold the new payment entries
        $newPayments = [];

        // Loop through each distinct customer ID to calculate the sum
        foreach ($distinctCustomerIds as $customerId) {
            $paymentSum = PaymentTracker::where('customer_id', $customerId)->sum('amount');
            // Prepare the new payment entry
            $newPayments[] = [
                'customer_id' => $customerId,
                'amount' => $paymentSum,
                'isCredit' => ($paymentSum < 0),
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ];
        }

        // Delete all entries in the PaymentTracker table
        PaymentTracker::truncate();

        // Insert the new payment entries
        PaymentTracker::insert($newPayments);

        return response()->json([
            'message' => 'All entries deleted and new entries added with the sums for each customer.',
            'new_payments' => $newPayments
        ]);
    }

    public function booking(Request $request)
    {
        // Validate the input to ensure the 'searchQuery' field is a string
        $request->validate([
            'id' => 'required|string'
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $id = $request->query('id'); 
        $orders = Order::with(['items'])->where('company_id', $user->company_id)->where('invoiceType',2)->where('orderStatus',2)->where('customer_id',$id)->get();
        return $orders;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'=> 'required|string',
            'mobile' => [
                'required',
                'string',
                Rule::unique('customers')->where('company_id', $request->company_id),
            ],
            'show'=> 'required',
            'company_id' => 'required'
        ]);
        return Customer::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user=Auth::user();
        $comapanyId = $user->company_id;
        $userType = $user->type;
        if($userType==0) {
            return Customer::find($id);
        }else{
            return Customer::where('company_id', $comapanyId)->find($id);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user=Auth::user();
        $comapanyId = $user->company_id;
        $userType = $user->type;

        $request->validate([
            'name'=> 'required|string',
            'mobile'=> 'required|string',
            'show'=> 'required',
            'company_id' => 'required'
        ]);
        
        if($userType==0) {
            $customer = Customer::find($id);
            $customer->update($request->all());
            return $customer;
        }else{
            $customer = Customer::where('company_id', $comapanyId)->find($id);
            $customer->update($request->all());
            return $customer;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user=Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        if($userType==0) {
            return Customer::destroy($id);
        }else{
            //Destroy if company id mataches
            return Customer::where('company_id', $companyId)->where('id', $id)->delete();
        }
    }
}
