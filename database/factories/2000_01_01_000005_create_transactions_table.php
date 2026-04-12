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
            $table->integer('barangay_id');
            $table->integer('municipal_id');
            $table->integer('province_id');
            $table->integer('region_id');
            $table->string('shipping_address');
            $table->string('reference_no')->unique(); // e.g. SRDI-2026-(random numbers)
            $table->decimal('total_amount', 15, 2);
            $table->string('receipt_path')->nullable(); // Para sa image ng physical receipt
            $table->string('transacted_by')->nullable(); // Pangalan ng staff
            $table->string('payment_method')->nullable(); 
            $table->string('order_type')->default('walk_in'); // walk_in, delivery
            $table->bigInteger('journal_entry_id')->unsigned()->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->enum('status', [
                        'Pending',         
                        'In Process',      
                        'Ready for Pickup',
                        'Completed',
                        'Cancelled'
                    ])->default('Pending');
            $table->boolean('is_rated')->default(false); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
