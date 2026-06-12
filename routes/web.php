<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

require __DIR__.'/settings.php';

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return Redirect('dashboard');
    })->name('home');
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::get('product', [MainController::class, 'product'])->name('product');
});

Route::prefix('api')->middleware(['api','throttle:60,1'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});
