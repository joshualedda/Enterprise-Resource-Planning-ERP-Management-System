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
        Schema::create('raw_product_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('raw_products');
            $table->foreignId('warehouse_id')->constrained('warehouses');
            $table->foreignId('batch_id')->nullable()->constrained('raw_product_batches');
            
            $table->decimal('quantity_on_hand', 14, 2)->default(0);
            $table->decimal('quantity_reserved', 14, 2)->default(0);
            
            $table->timestamps();

            $table->unique(['product_id', 'warehouse_id', 'batch_id'], 'raw_prod_stocks_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raw_product_stocks');
    }
};
