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
            $table->string('reference_no')->unique(); // e.g. DSERI-2026-0001
            $table->decimal('total_amount', 15, 2);
            $table->string('receipt_path')->nullable(); // Para sa image ng physical receipt
            $table->string('transacted_by')->nullable(); // Pangalan ng staff
            $table->enum('status', ['pending', 'paid', 'cancelled', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
