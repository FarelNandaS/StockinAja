<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMutations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function store(Request $request) {
        DB::beginTransaction();

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

        $product = Product::create($validator->validated());

        StockMutations::create([
            'product_id'=>$product->id,
            'user_id'=>Auth::id(),
            'type'=>'In',
            'amount'=>$request->quantity,
            'initial_quantity'=>0,
            'final_quantity'=>$request->quantity,
            'notes'=>'New product create by admin'
        ]);

        $resData = Product::all()->toArray();

        DB::commit();

        return response()->json([
            'name'=>$validator->getData()['name'],
            'products'=>$resData,
        ]);
    }

    public function destroy(Request $request, $id) {
        DB::beginTransaction();

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

        DB::commit();

        return response()->json([
            'name'=>$productName,
            'products'=>$resData,
        ]);
    }

    public function update(Request $request, $id) {
        DB::beginTransaction();

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
            $oldQuantity = $product->quantity;
            $diff = $validated['quantity'] - $product->quantity;

            $product->update([
                'name'=>$validated['name'],
                'quantity'=>$validated['quantity'],
            ]);

            if ($oldQuantity != $validated['quantity']) {
                StockMutations::create([
                    'product_id'=>$product->id,
                    'user_id'=>auth()->id(),
                    'type'=>$diff > 0 ? 'In' : 'Out',
                    'amount'=>abs($diff),
                    'initial_quantity'=>$oldQuantity,
                    'final_quantity'=>$product->quantity,
                    'notes'=>'Stock adjustment by admin (Stock opname)'
                ]);
            }

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

            StockMutations::create([
                'product_id'=>$product->id,
                'user_id'=>auth()->id(),
                'type'=>$validated['type'],
                'amount'=>$validated['quantity'],
                'initial_quantity'=>$currentQuantity,
                'final_quantity'=>$newQuantity,
                'notes'=>'User with name ' . auth()->user()->name . ' manage the stock with note: ' . ($request->notes ?? 'No notes provide'),
            ]);

            $productName = $product->name;
        }

        $resData = Product::all()->toArray();

        DB::commit();

        return response()->json([
            'name'=>$productName,
            'products'=>$resData,
        ]);
    }

    public function getMutations($id) {
        $mutations = StockMutations::where('product_id', $id)->orderBy('created_at', 'desc')->get()->map(function ($log) {
            return [
                'date'=>$log->created_at->diffForHumans(),
                'type'=>$log->type,
                'amount'=>$log->amount,
                'balance'=>$log->initial_quantity . ' -> ' . $log->final_quantity,
                'note'=>$log->notes,
            ];
        });

        return response()->json([
            'mutations'=>$mutations,
        ]);
    }
}
