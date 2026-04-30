<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_run_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained('simulation_runs')->cascadeOnDelete();
            $table->foreignId('step_id')->constrained('simulation_steps')->cascadeOnDelete();
            $table->foreignId('choice_id')->constrained('simulation_choices')->cascadeOnDelete();
            $table->boolean('is_safe')->default(true);
            $table->integer('score_delta')->default(0);
            $table->timestamps();

            $table->index(['run_id', 'is_safe']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_run_events');
    }
};
