<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;
    protected $fillable=[
        'order_id',
        'product_id',
        'product_sizes_id',
        'product_name',
        'product_unit',
        'product_local_name',
        'size_name',
        'size_local_name',
        'dQty',
        'eQty',
        'oPrice',
        'dPrice',
        'total_price',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
