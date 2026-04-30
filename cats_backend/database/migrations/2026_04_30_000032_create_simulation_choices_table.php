<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_choices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('step_id')->constrained('simulation_steps')->cascadeOnDelete();
            $table->foreignId('next_step_id')->nullable()->constrained('simulation_steps')->nullOnDelete();
            $table->text('text');
            $table->boolean('is_safe')->default(true);
            $table->integer('score_delta')->default(0);
            $table->text('feedback')->nullable();
            $table->text('explanation')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['step_id', 'is_safe']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_choices');
    }
};
