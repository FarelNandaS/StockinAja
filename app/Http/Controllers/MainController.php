<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('dashboard');
    }

    public function product()
    {
        $products = Product::all()->toArray();
        // dd($products);
        return Inertia::render('product', [
            'products'=>$products
        ]);
    }

    public function users() {
        $users = User::with('roles:name')->get()->map(function ($user) {
            return [
                'id'=>$user->id,
                'name'=>$user->name,
                'email'=>$user->email,
                'role'=>$user->roles()->first()?->name ?? 'No Role',
            ];
        });
        // dd($users);
        return Inertia::render('users', [
            'users'=>$users
        ]);
    }
}
