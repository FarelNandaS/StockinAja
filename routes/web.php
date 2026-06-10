<?php

use App\Http\Controllers\MainController;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

require __DIR__.'/settings.php';

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return Redirect('dashboard');
    })->name('home');
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::inertia('product', 'product')->name('product');
});

