<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable=[
        'name',
        'slug',
        'localName',
        'categoryId',
        'subCategoryId',
        'subSubCategoryId',
        'brandId',
        'badge',
        'unit',
        'incStep',
        'shortDesc',
        'localShortDesc',
        'desc',
        'localDesc',
        'multiSize',
        'showOnHome',
        'rating',
        'show',
        'company_id',
        'created_by',
        'updated_by'
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
     * Get the medis for the product.
     */
    public function media()
    {
        return $this->hasMany(ProductMedia::class);
    }

    /**
     * Get the sizes for the product.
     */
    public function size()
    {
        return $this->hasMany(ProductSize::class);
    }
}
