<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTracker extends Model
{
    use HasFactory;
    protected $fillable=[
        'customer_id',
        'amount',
        'isCredit',
        'created_by',
        'updated_by'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id'); // Define foreign key explicitly if needed
    }
}
