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
        if (empty($request->type)) {
            $validator = Validator::make(['id'=>$id, 'name'=>$request->name, 'quantity'=>$request->quantity], [
                'id'=>'required',
                'name'=>'required|string|max:255',
                'quantity'=>'required|integer|min:0',
            ]);
        } else {
            $validator = Validator::make(['id'=>$id, 'quantity'=>$request->quantity, 'type'=>$request->type], [
                'id'=>'required',
                'quantity'=>'required|integer|min:0',
                'type'=>'required|in:In,Out'
            ]);
        }

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

        if (empty($request->type)) {
            $product->update([
                'name'=>$validated['name'],
                'quantity'=>$validated['quantity'],
            ]);
            $productName = $product->name;
        } else {
            $currentQuantity = $product->quantity;

            if ($validated['type'] === 'In') {
                $newQuantity = $currentQuantity + $validated['quantity'];
            } else {
                $newQuantity = $currentQuantity - $validated['quantity'];

                if ($newQuantity < 0) {
                    return response()->json([
                        'status'=>'error',
                        'message'=>'Insufficient stock! Current stock only remaining ' . $currentQuantity,
                    ], 422);
                }
            }

            $product->update(['quantity'=>$newQuantity]);
            $productName = $product->name;
        }

        $resData = Product::all()->toArray();

        return response()->json([
            'name'=>$productName,
            'products'=>$resData,
        ]);
    }
}
