<?php

namespace App\Http\Controllers;

use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentTrackerController extends Controller
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
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        if ($userType == 0) {
            return PaymentTracker::all(); // Admin can see all records
        } else {
            return PaymentTracker::where('company_id', $companyId)->get(); // Non-admin can see only their company's records
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'customer_id' => 'required|integer',
            'isCredit' => 'required|boolean',
        ]);

        // Create a new PaymentTracker record
        return PaymentTracker::create(array_merge($request->all(), [
            'created_by' => $this->user->id, // Track who created the record
        ]));
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        if ($userType == 0) {
            return PaymentTracker::find($id); // Admin can see any record
        } else {
            return PaymentTracker::where('company_id', $companyId)->find($id); // Non-admin can see only their company's records
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        $request->validate([
            'amount' => 'required|numeric',
            'customer_id' => 'required|integer',
            'isCredit' => 'required|boolean',
        ]);

        if ($userType == 0) {
            $paymentTracker = PaymentTracker::find($id);
            $paymentTracker->update(array_merge($request->all(), [
                'updated_by' => $this->user->id, // Track who updated the record
            ]));
            return $paymentTracker;
        } else {
            $paymentTracker = PaymentTracker::where('company_id', $companyId)->find($id);
            if ($paymentTracker) {
                $paymentTracker->update(array_merge($request->all(), [
                    'updated_by' => $this->user->id,
                ]));
                return $paymentTracker;
            }
            return response()->json(['message' => 'Not found'], 404); // Not found response
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        if ($userType == 0) {
            return PaymentTracker::destroy($id); // Admin can delete any record
        } else {
            // Destroy if company ID matches
            return PaymentTracker::where('company_id', $companyId)->destroy($id);
        }
    }
}