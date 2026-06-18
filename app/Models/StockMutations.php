<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMutations extends Model
{
    protected $fillable = ['product_id', 'user_id', 'type', 'amount', 'initial_quantity', 'final_quantity', 'notes'];

    public function product() {
        return $this->belongsTo(Product::class);
    }
}
