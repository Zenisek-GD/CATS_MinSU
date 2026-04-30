<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('simulation_id')->constrained('simulations')->cascadeOnDelete();
            $table->enum('status', ['in_progress', 'completed', 'expired'])->default('in_progress');
            $table->unsignedInteger('time_limit_seconds')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->integer('score')->default(0);
            $table->unsignedInteger('max_score')->default(100);
            $table->foreignId('current_step_id')->nullable()->constrained('simulation_steps')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'simulation_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_runs');
    }
};
