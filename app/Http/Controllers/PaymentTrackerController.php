<?php

namespace App\Http\Controllers;

use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentTrackerController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    // List all payments for admin or specific company payments
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        // Log user details for debugging
        Log::info("User ID: " . $user->id);
        Log::info("Company ID: " . $companyId);
        Log::info("User Type: " . $userType);

        if ($userType == 0) {
            return PaymentTracker::all();
        } else {
            return PaymentTracker::where('company_id', $companyId)->get();
        }
    }

    // Show a specific payment record
    public function show($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        // Log for debugging
        Log::info("Fetching payment record for ID: " . $id);

        if ($userType == 0) {
            return PaymentTracker::find($id);
        } else {
            return PaymentTracker::where('company_id', $companyId)->find($id);
        }
    }

    // Store a new payment record
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'customer_id' => 'required|integer',
            'isCredit' => 'required|boolean',
        ]);

        // Log for debugging
        Log::info("Storing new payment record for customer ID: " . $request->customer_id);

        return PaymentTracker::create(array_merge($request->all(), [
            'created_by' => $this->user->id,
            'company_id' => $this->user->company_id,
        ]));
    }

    // Update return payment (used in handleReturnMoneySubmit)
    public function update(Request $request, $customerId)
    {
        $request->validate([
            'returnAmount' => 'required|numeric',
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        // Log for debugging
        Log::info("Updating payment record for customer ID: " . $customerId . " with returnAmount: " . $request->returnAmount);

        // Fetch the payment tracker based on customer_id
        $paymentTracker = PaymentTracker::where('customer_id', $customerId)->first();

        // Check if the record exists
        if (!$paymentTracker) {
            return response()->json(['message' => 'Not found'], 404);
        }

        // Update the amount
        $paymentTracker->update([
            'amount' => $paymentTracker->amount - $request->returnAmount,
            'updated_by' => $this->user->id,
        ]);

        // Return the updated payment tracker
        return response()->json($paymentTracker, 200);
    }

    // Delete a payment record
    public function destroy($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        // Log for debugging
        Log::info("Deleting payment record for ID: " . $id);

        $paymentTracker = PaymentTracker::where('id', $id)
            ->where(function ($query) use ($userType, $companyId) {
                if ($userType != 0) {
                    $query->where('company_id', $companyId);
                }
            })->first();

        if ($paymentTracker) {
            $paymentTracker->delete();
            return response()->json(['message' => 'Deleted successfully'], 200);
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    /**
     * Update the amount for a specific payment tracker.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $customerId
     * @return \Illuminate\Http\Response
     */
    public function updateAmount(Request $request, $customerId)
    {
        // Validate the incoming data
        $request->validate([
            'amount' => 'required|numeric', // You can adjust the validation as needed
        ]);

        // Retrieve the amount from the request
        $amount = $request->input('amount');

        // Log for debugging
        Log::info("Updating amount for customer ID: " . $customerId . " with amount: " . $amount);

        // Find the payment tracker record by customer_id
        $paymentTracker = PaymentTracker::where('customer_id', $customerId)->first();

        // Check if the record exists
        if (!$paymentTracker) {
            return response()->json(['error' => 'Payment tracker not found for the given customer.'], 404);
        }

        // Update the amount
        $paymentTracker->amount = $amount;
        $paymentTracker->save();

        // Return a success response
        return response()->json(['message' => 'Amount updated successfully.'], 200);
    }
}
