<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductMedia extends Model
{
    protected $table = 'product_medias';
    use HasFactory;
    protected $fillable=[
        'url',
        'type',
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
