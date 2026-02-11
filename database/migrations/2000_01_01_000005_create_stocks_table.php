<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('batch_no', 60)->nullable();
            $table->integer('stock')->default(0);

            $table->enum('availability', ['available', 'low', 'out_of_stock'])->default('available');

            $table->integer('restore_point')->default(0);

            // (for wine category) - from your ERD
            $table->date('expiration_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
