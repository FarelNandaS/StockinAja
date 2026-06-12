<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'name'=>'required|string|max:255',
            'quantity'=>'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'=>'error',
                'message'=>$validator->errors()->first(),
            ], 422);
        }

        Product::create($validator->validated());
        $resData = Product::all()->toArray();

        return response()->json([
            'name'=>$validator->getData()['name'],
            'products'=>$resData,
        ]);
    }

    public function destroy(Request $request, $id) {
        $validator = Validator::make(['id'=>$id], [
            'id'=>'required'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status'=>'error',
                'message'=>$validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();
        $product = Product::find($validated['id']);

        if (!$product) {
            return response()->json([
                'status'=>'error',
                'message'=>'Product is not found'
            ], 422);
        }

        $productName = $product->name;
        $product->delete();
        $resData = Product::all()->toArray();

        return response()->json([
            'name'=>$productName,
            'products'=>$resData,
        ]);
    }

    public function update(Request $request, $id) {
        $validator = Validator::make(['id'=>$id, 'name'=>$request->name, 'quantity'=>$request->quantity], [
            'id'=>'required',
            'name'=>'required|string|max:255',
            'quantity'=>'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'=>'error',
                'message'=>$validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();
        $product = Product::find($validated['id']);
        $oldName = $product->name;

        if (!$product) {
            return response()->json([
                'status'=>'error',
                'message'=>'Product is not found'
            ], 422);
        }

        $product->update([
            'name'=>$validated['name'],
            'quantity'=>$validated['quantity'],
        ]);
        $newName = $product->name;

        $resData = Product::all()->toArray();

        return response()->json([
            'oldName'=>$oldName,
            'newName'=>$newName,
            'products'=>$resData,
        ]);
    }
}
