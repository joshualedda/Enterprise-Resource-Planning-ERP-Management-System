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
            $table->string('payment_method')->nullable(); // Contact number ng customer
            $table->string('order_type')->default('walk_in'); // walk_in, delivery
            $table->enum('status', [
                        'Pending',         // Default status kapag bagong order
                        'In Process',      // Parehong meron
                        'On Delivery',     // Para sa Delivery lang
                        'Ready for Pickup',// Para sa Walk-in lang
                        'Completed',       // Parehong meron
                        'Cancelled'        // Parehong meron
                    ])->default('In Process');
            $table->boolean('is_rated')->default(false); // Para malaman kung rated na ng customer  
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
