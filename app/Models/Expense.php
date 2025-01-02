<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;
    protected $fillable=[
        'name',
        'desc',
        'expense_id',
        'qty',
        'price',
        'total_price',
        'expense_date',
        'show',
        'company_id',
        'created_by',
        'updated_by'
    ];

    // /**
    //  * Get the item.
    //  */
    public function type()
    {
        return $this->belongTo(ExpenseType::class,'expense_id');
    }

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
