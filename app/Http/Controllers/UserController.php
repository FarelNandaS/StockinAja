<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|max:255',
            'role' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ])->assignRole($validated['role']);
        $resData = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles()->first()?->name ?? 'No Role',
            ];
        });

        return response()->json([
            'name' => $validated['name'],
            'users' => $resData
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $validator = Validator::make(['id' => $id], [
            'id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        $validated = $validator->validated();
        $user = User::find($validated['id']);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not found'
            ], 422);
        }

        $userName = $user->name;
        $user->delete();
        $users = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles()->first()->name ?? 'No Role'
            ];
        });

        return response()->json([
            'name' => $userName,
            'users' => $users
        ]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make(['id' => $id, 'name' => $request->name, 'email' => $request->email, 'role' => $request->role], [
            'id' => 'required',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role'=>'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'=>'error',
                'message'=>$validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();
        $user = User::find($validated['id']);
        
        if (!$user) {
            return response()->json([
                'status'=>'error',
                'message'=>'User is not found',
            ], 422);
        }

        $user->update([
            'name'=>$validated['name'],
            'email'=>$validated['email'],
        ]);

        if ($user->roles()->first()->name !== $validated['role']) {
            $oldRole = $user->roles()->first()->name;
            $user->removeRole($oldRole);
            $user->assignRole($validated['role']);
        }

        $users = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id'=>$user->id,
                'name'=>$user->name,
                'email'=>$user->email,
                'role'=>$user->roles()->first()->name,
            ];
        });

        return response()->json([
            'users'=>$users,
            'name'=>$user->name
        ]);
    }
}
