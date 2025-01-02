<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    protected $table = 'product_sizes';
    use HasFactory;
    protected $fillable=[
        'product_id',
        'name',
        'localName',
        'bPrice',
        'oPrice',
        'dPrice',
        'qty',
        'stock',
        'booked',
        'returnable',
        'show'
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

    /**
     * Get the the product.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
