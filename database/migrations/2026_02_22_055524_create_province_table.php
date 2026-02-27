<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('province', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')
                  ->constrained()
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            $table->string('province_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('province');
    }
};