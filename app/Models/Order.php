<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $fillable=[
        'customer_id',
        'long',
        'lat',
        'finalAmount',
        'totalAmount',
        'paidAmount',
        'discount',
        'profit',
        'payLater',
        'isSettled',
        'paymentType',
        'invoiceType',
        'orderStatus',
        'deliveryDate',
        'deliveryTime',
        'invoiceDate',
        'show',
        'company_id',
        'created_by',
        'updated_by'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id'); // Assuming 'customer_id' is the foreign key in the orders table
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by'); // Assuming 'customer_id' is the foreign key in the orders table
    }

    /**
     * Get the item.
     */
    public function items()
    {
        return $this->hasMany(OrderDetail::class);
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
