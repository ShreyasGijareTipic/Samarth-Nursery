<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->string('localName')->nullable();
            $table->integer('categoryId')->nullable();
            $table->integer('subCategoryId')->nullable();
            $table->integer('subSubCategoryId')->nullable();
            $table->integer('brandId')->nullable();
            $table->string('badge')->nullable();
            $table->string('unit')->nullable();
            $table->double('incStep')->nullable();
            $table->double('rating')->default(5);
            $table->integer('reviews')->default(0);
            $table->longText('shortDesc')->nullable();
            $table->longText('localShortDesc')->nullable();
            $table->longText('desc')->nullable();
            $table->longText('localDesc')->nullable();
            $table->boolean('multiSize')->default(false);
            $table->boolean('showOnHome')->default(true);
            $table->boolean('show')->default(true);
            $table->integer('company_id');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->string('name');
            $table->string('localName')->nullable();
            $table->double('bPrice')->default(0);
            $table->double('oPrice')->default(0);
            $table->double('dPrice')->default(0);
            $table->integer('qty')->default(0);
            $table->integer('stock')->default(0);
            $table->integer('booked')->default(0);
            $table->integer('company_id');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->boolean('returnable')->default(true);
            $table->boolean('show')->default(true);
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::create('product_medias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->string('url');
            $table->string('type');
            $table->boolean('show')->default(true);
            $table->integer('company_id');
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_medias');
        Schema::dropIfExists('product_sizes');
        Schema::dropIfExists('products');
    }
};
