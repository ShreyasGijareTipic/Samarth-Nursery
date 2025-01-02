<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\CompanyInfo;

class CompanyInfoController extends Controller
{  
    public function index(Request $request)
    {
        $user = Auth::user();
        if($user->type==0) {
            return CompanyInfo::all();
        }else{
            return CompanyInfo::where('company_id', $user->company_id)->get();
        }
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'land_mark' => 'required|string|max:255',
            'companyName' => 'required|string|max:255',
            'Tal' => 'required|string|max:255',
            'Dist' => 'required|string|max:255',
            'Pincode' => 'required|integer',
            'phone_no' => 'required|string|max:15',
            'bank_name' => 'required|string|max:255',
            'account_no' => 'required|string|max:255',
            'IFSC' => 'required|string|max:255',
            'logo' => 'required|string',
            'sign' => 'required|string', // Assuming sign is also an image file
            'paymentQRCode' => 'required|string', 
            'appMode' => 'required|string',
        ]);

        // Save the company info to the database
        $CompanyInfo = new CompanyInfo;
        $CompanyInfo->company_name = $request->input('companyName');
        $CompanyInfo->land_mark = $request->input('land_mark');
        $CompanyInfo->tal = $request->input('Tal');
        $CompanyInfo->dist = $request->input('Dist');
        $CompanyInfo->pincode = $request->input('Pincode');
        $CompanyInfo->phone_no = $request->input('phone_no');
        $CompanyInfo->bank_name = $request->input('bank_name');
        $CompanyInfo->account_no = $request->input('account_no');
        $CompanyInfo->ifsc_code = $request->input('IFSC');
        $CompanyInfo->logo = $request->input('logo'); 
        $CompanyInfo->sign = $request->input('sign');  
        $CompanyInfo->paymentQRCode = $request->input('paymentQRCode');  
        $CompanyInfo->appMode = $request->input('appMode');  
        $CompanyInfo->block_status = 0;

        $CompanyInfo->save();

        return response()->json(['message' => 'New company is registered successfully'], 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return CompanyInfo::where('company_id', $id)->firstOrFail();
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
        $companyInfo = CompanyInfo::where('company_id', $id)->firstOrFail();
        $companyInfo->update($request->all());
        return $companyInfo;
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
        if($user->type==0) {
            $company = CompanyInfo::where('company_id', $id)->firstOrFail();
            return $company->delete();
        }
        return response()->json(['message' => 'Not allowed'], 401); 
    }

}
