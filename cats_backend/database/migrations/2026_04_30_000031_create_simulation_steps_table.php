<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_id')->constrained('simulations')->cascadeOnDelete();
            $table->unsignedSmallInteger('step_order')->default(0);
            $table->string('title')->nullable();
            $table->text('prompt');
            $table->text('education')->nullable();
            $table->timestamps();

            $table->index(['simulation_id', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_steps');
    }
};
