<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); 
            $table->string('reference_no')->unique(); // e.g. SRDI-2026-(random numbers)
            $table->decimal('total_amount', 15, 2);
            $table->string('receipt_path')->nullable(); // Para sa image ng physical receipt
            $table->string('transacted_by')->nullable(); // Pangalan ng staff
            $table->enum('status', ['Pending', 'In Process', 'Completed', 'Cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
