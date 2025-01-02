<?php

namespace App\Http\Controllers;

use App\Models\JarTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JarTrackerController extends Controller
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
            return JarTracker::all(); // Admin can see all records
        } else {
            return JarTracker::where('company_id', $companyId)->get(); // Non-admin can see only their company's records
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'quantity' => 'required|integer',
            'customer_id' => 'required|integer',
            // Add other validation rules as necessary
        ]);

        // Create a new JarTracker record
        return JarTracker::create(array_merge($request->all(), [
            'created_by' => $this->user->id, // Assuming you want to track who created the record
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
            return JarTracker::find($id); // Admin can see any record
        } else {
            return JarTracker::where('company_id', $companyId)->find($id); // Non-admin can see only their company's records
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
            'quantity' => 'required|integer',
            'customer_id' => 'required|integer',
            // Add other validation rules as necessary
        ]);

        if ($userType == 0) {
            $jarTracker = JarTracker::find($id);
            $jarTracker->update(array_merge($request->all(), [
                'updated_by' => $this->user->id, // Track who updated the record
            ]));
            return $jarTracker;
        } else {
            $jarTracker = JarTracker::where('company_id', $companyId)->find($id);
            if ($jarTracker) {
                $jarTracker->update(array_merge($request->all(), [
                    'updated_by' => $this->user->id,
                ]));
                return $jarTracker;
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
            return JarTracker::destroy($id); // Admin can delete any record
        } else {
            // Destroy if company ID matches
            return JarTracker::where('company_id', $companyId)->destroy($id);
        }
    }
}