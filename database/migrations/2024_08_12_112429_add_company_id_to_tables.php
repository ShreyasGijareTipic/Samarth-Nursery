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
        Schema::table('users', function (Blueprint $table) {
           
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
        });
        

        Schema::table('categories', function (Blueprint $table) {
            $table->integer('company_id');
        });
 
        Schema::table('expense_types', function (Blueprint $table) {
            $table->integer('company_id');
        });
 
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('company_id');
            $table->integer('created_by');
            $table->integer('updated_by');
        });
 
        Schema::table('expenses', function (Blueprint $table) {
            $table->integer('company_id');
            $table->integer('created_by');
            $table->integer('updated_by');
        });
    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_id']);
        });
 
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['company_id']);
        });
 
        Schema::table('expense_types', function (Blueprint $table) {
            $table->dropColumn(['company_id']);
        });
 
        // Check if table exists before altering it
        if (Schema::hasTable('product_medias')) {
            Schema::table('product_medias', function (Blueprint $table) {
                $table->dropColumn(['company_id']);
            });
        }
 
        if (Schema::hasTable('product_sizes')) {
            Schema::table('product_sizes', function (Blueprint $table) {
                $table->dropColumn(['company_id']);
            });
        }
 
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['company_id']);
            $table->dropColumn(['created_by']);
            $table->dropColumn(['updated_by']);
        });
 
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('company_id');
            $table->dropColumn('created_by');
            $table->dropColumn('updated_by');
        });
 
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('company_id');
            $table->dropColumn('created_by');
            $table->dropColumn('updated_by');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_id']);
           
        });

        
    }
};