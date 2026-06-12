<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'name'=>'required|string|max:255',
            'email'=>'required|email|unique:users,email',
            'password'=>'required|string|max:255',
            'role'=>'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'=>'error',
                'message'=>$validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();

        User::create([
            'name'=>$validated['name'],
            'email'=>$validated['email'],
            'password'=>Hash::make($validated['password']),
        ])->assignRole($validated['role']);
        $resData = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id'=>$user->id,
                'name'=>$user->name,
                'email'=>$user->email,
                'role'=>$user->roles()->first()?->name ?? 'No Role',
            ];
        });

        return response()->json([
            'name'=>$validated['name'],
            'users'=>$resData
        ]);
    }
}
