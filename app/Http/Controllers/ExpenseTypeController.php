<?php

namespace App\Http\Controllers;

use App\Models\ExpenseType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();
        return ExpenseType::where('company_id', $user->company_id)->get();
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
            'name' => 'required',
            'localName' => 'required',
            'desc' => 'required',
            'show' => 'required'
        ]);

        $data = $request->all();
        $data['company_id'] = $user->company_id;

        return ExpenseType::create($data);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = Auth::user();
        return ExpenseType::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();
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
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'localName' => 'required',
            'desc' => 'required',
            'show' => 'required'
        ]);

        $expenseType = ExpenseType::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        $expenseType->update($request->all());

        return $expenseType;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $expenseType = ExpenseType::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return $expenseType->delete();
    }
}
