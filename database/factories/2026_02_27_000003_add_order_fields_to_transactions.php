<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('order_type', ['walk_in', 'delivery'])->default('walk_in')->after('transacted_by');
            $table->enum('payment_method', ['bank_to_bank', 'cash_on_hand'])->default('bank_to_bank')->after('order_type');
            $table->string('street_number')->nullable()->after('payment_method');
            $table->string('barangay')->nullable()->after('street_number');
            $table->string('municipality')->nullable()->after('barangay');
            $table->string('province')->nullable()->after('municipality');
            $table->string('zip_code')->nullable()->after('province');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['order_type','payment_method','street_number','barangay','municipality','province','zip_code']);
        });
    }
};
