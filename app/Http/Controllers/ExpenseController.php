<?php
namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {   
        $user=Auth::user();
        $comapanyId = $user->company_id;
        $userType = $user->type;
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        
        try {
            if($userType==0||$userType==1){
                    if ($startDate && $endDate) {
                        $query=Expense::where('company_id',$comapanyId)
                        ->whereBetween('expense_date', [$startDate, $endDate]);
                        return $query->get();
                        }
                    else{
                    return response()->json([
                        'error' => 'Dates are not Selected properly' ]);
                    } }
            else{
            return response()->json([
                'error' => 'Not Allowed', 
                ]);
            }  }
        catch(Exception $e) {
            return $e->getMessage();
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

        $request->validate([
            'name' => 'required|string',
            'expense_date' => 'required|date',
            'price' => 'required|integer|min:0',
            'qty' => 'required|integer|min:0',
            'total_price' => 'required|integer|min:0',
            'show' => 'required|boolean',
        ]);
        
        $expStore = Expense::create([
            'name' => $request->name,
            'expense_date' => $request->expense_date,
            'price' => $request->price,
            'qty' => $request->qty,
            'total_price' => $request->total_price,
            'expense_id' => $request->expense_id,
            'show' => $request->show,
            'company_id' => $user->company_id, 
            'created_by' => $user->id, 
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Expense created successfully.',
            'expense' => $expStore,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {

        $user=Auth::user();
        $comapanyId = $user->company_id;
        $userType = $user->type;
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        
        try {
              if($userType==0||$userType==1){
                 $expense = Expense::where('id', $id)->where('company_id', $comapanyId)->first();
                 return $expense;}

              elseif (!$expense) {
               return response()->json(['message' => 'Expense not found'], 404);
             }
            }
        catch(Exception $e){
            return $e->getMessage();
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {   
        $user=Auth::user();
        
        $request->validate([
            'name' => 'required|string',
            'expense_date' => 'required|date',
            'price' => 'required|integer|min:0',
            'qty' => 'required|integer|min:0',
            'total_price' => 'required|integer|min:0',
            'show' => 'required|boolean',
        ]);

        $expense = Expense::where('id', $id)->where('company_id', $company_id)->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->update([
            'name'=> $request->name,
            'expense_date'=> $request->expense_date,
            'price'=> $request->price,
            'qty'=> $request->qty,
            'total_price'=> $request->total_price,
            'show'=> $request->show,
            'company_id' => $user->company_id, 
            'updated_by' => $user->id, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully.',
            'expense' => $expense,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $company_id = $this->user->company_id;

        $expense = Expense::where('id', $id)->where('company_id', $company_id)->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully.',
        ]);
    }
}
