<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
}
