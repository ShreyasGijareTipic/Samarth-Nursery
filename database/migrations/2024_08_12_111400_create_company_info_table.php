<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('company_info', function (Blueprint $table) {
            $table->integer('company_id')->primary()->autoIncrement();
            $table->string('company_name');
            $table->boolean('block_status');
            $table->string('logo');
            $table->string('sign');
            $table->string('land_mark');
            $table->string('Tal');
            $table->string('Dist');
            $table->integer('pincode');
            $table->string('phone_no')->unique();
            $table->string('bank_name');
            $table->string('account_no');
            $table->string('IFSC_code');
            $table->string('paymentQRCode');
            $table->string('appMode')->default('');
 
            $table->timestamps();
        });
    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_info');
     }
};
 