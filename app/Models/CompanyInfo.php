<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyInfo extends Model
{
    use HasFactory;
    protected $table = 'company_info';
    protected $fillable=[
    'comapany_id',
    'land_mark' ,
    'Tal'  ,
    'Dist' ,
    'Pincode',
    'phone_no',
    'bank_name',
    'account_no',
    'IFSC_code',
    'logo',
    'sign',
    'paymentQRCode',
    'block_status',
    'company_name',
    'appMode'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    protected $primaryKey = 'company_id';
}
