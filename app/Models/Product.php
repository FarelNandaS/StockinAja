<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'quantity'];

    public function mutations() {
        return $this->hasMany(StockMutations::class);
    }
}
