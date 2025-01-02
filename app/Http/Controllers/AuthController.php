<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class AuthController extends Controller
{
    function register(Request $request){
        $fields = $request->validate([
            'name' => 'required|string',
            'mobile' => 'required|string|unique:users',
            'type' => 'required',
            'email' => 'nullable|string|unique:users,email',
            'password' => 'required|string|confirmed',
            'company_id' => 'required'
        ]);

        $user = User::create([
            'name'=> $fields['name'],
            'email'=> $fields['email'],
            'mobile'=> $fields['mobile'],
            'type'=> $fields['type'],
            'company_id'=> $fields['company_id'],
            'password'=> bcrypt($fields['password'])
        ]);

        $token = $user->createToken('webapp')->plainTextToken;
        $response = [
            'user'=> $user,
            'token'=> $token
        ];
        return response($response,201);
    }

    function update(Request $request){
        $fields = $request->validate([
            'id' => 'required',
            'name' => 'required|string',
            'mobile' => 'required',
            'type' => 'required',
            'email' => 'required',
            'company_id' => 'required',
            'blocked'=> 'required',
        ]);
        $user = User::where('id',$fields['id'])->first();
        $user->update([
            'name'=> $request->name,
            'mobile'=> $request->mobile,
            'type'=> $request->type,
            'company_id' => $request->company_id, 
            'blocked' => $request->blocked,
            //'updated_by' => $user->id, 
        ]);
        $user->save();
        return response()->json([
            'success' => true,
            'message' => 'Updated successfully.',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);
    
        // Check if email exists
        $user = User::with(['CompanyInfo'])->where('email', $fields['email'])->first();
    
        // Check password
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }
    
        // Check if user is blocked
        //|| $user['company_info']->block_status == 1
        if ($user->blocked == 1) {
            return response()->json([
                'message' => 'User not allowed. Kindly contact admin.',
                'blocked'=> true,
                '$user'=> $user
            ], 201);
        }

        if ($user->CompanyInfo->block_status == 1) {
            return response()->json([
                'message' => 'Company not allowed. Kindly contact admin.',
                'blocked' => true
            ], 201);
        }
        

        $token = $user->createToken('webapp',[$user])->plainTextToken;
        $response = [
            'user' => $user,
            'token' => $token
        ];
        return response()->json($response, 201);
    }

    function mobileLogin(Request $request){
        $fields = $request->validate([
            'mobile' => 'required|string',
            'password' => 'required|string'
        ]);

        //Check if mobile no exists
        $user = User::where('mobile',$fields['mobile'])->first();

        //Check password
        if(!$user || !Hash::check($fields['password'], $user->password)){
            return response->json([
                'message'=>'Please provide valid credentials'
            ],401);
        }

        if($user->blocked == 1){
            return response([
                'message'=>'Kindly contact admin'
            ],401);
        }

        $token = $user->createToken('mobileLoginToken')->plainTextToken;
        $response = [
            'user'=> $user,
            'token'=> $token
        ];
        return response($response,201);
    }

    function logout(Request $request){
        auth()->user()->tokens()->delete();
        return ['message'=>'Logged out'];
    }

    function changePassword(Request $request){
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
            'new_password' => 'required|string',
        ]);

        //Check if email exists
        $user = User::where('email',$fields['email'])->first();

        //Check password
        if(!$user || !Hash::check($fields['password'], $user->password)){
            return response([
                'message'=>'Please provide valid credentials'
            ],401);
        }else{
            $user->password =  bcrypt($fields['new_password']);
            $user->save();
            auth()->user()->tokens()->delete();
        }

        $token = $user->createToken('webapp')->plainTextToken;
        $response = [
            'Message'=> 'Password Changed Successfully,Login with new Password',
            'status'=> 1
            // 'user'=> $user,
            // 'token'=> $token
        ];
        return response($response,200);
    }

    public function allUsers(Request $request)
    {
        $companyId = Auth::user()->company_id;
    
        if ($request->customers == 'true') {
            // Filter users by company_id and type
            return User::where('type', 10)
                       ->where('company_id', $companyId)
                       ->paginate(50);
        }
        
        // Filter users by company_id and type < 10
        return User::where('type', '<', 10)
                   ->where('company_id', $companyId)
                   ->paginate(50);
    }
    
    function registerUser(Request $request){
        $fields = $request->validate([
            'name' => 'required|string',
            'mobile' => 'required|string|unique:users,mobile',
            'type' => 'required',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name'=> $fields['name'],
            'email'=> $fields['email'],
            'mobile'=> $fields['mobile'],
            'type'=> $fields['type'],
            'password'=> bcrypt($fields['password'])
        ]);
        return response($user,201);
    }
}
