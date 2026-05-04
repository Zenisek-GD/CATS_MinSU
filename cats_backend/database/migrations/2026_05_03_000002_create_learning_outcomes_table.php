<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('learning_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Activity tracking
            $table->enum('activity_type', ['quiz_attempt', 'simulation_run', 'module_completion'])->default('quiz_attempt');
            $table->foreignId('quiz_attempt_id')->nullable()->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignId('simulation_run_id')->nullable()->constrained('simulation_runs')->cascadeOnDelete();
            $table->foreignId('training_module_id')->nullable()->constrained('training_modules')->cascadeOnDelete();

            // Learning metrics
            $table->unsignedInteger('time_spent_seconds')->default(0); // Total engagement time
            $table->decimal('performance_score', 5, 2)->default(0); // Quiz/sim score
            $table->decimal('engagement_level', 3, 2)->default(0); // 0-1 scale based on interaction

            // Behavioral tracking
            $table->json('interactions_summary')->nullable(); // e.g., {"hints_used": 2, "attempts": 3, "paths_explored": ["phishing", "malware"]}
            $table->boolean('is_completed')->default(false);

            // Learning gain & effectiveness
            $table->unsignedTinyInteger('knowledge_level_pre')->nullable(); // Pre-assessment (1-5)
            $table->unsignedTinyInteger('knowledge_level_post')->nullable(); // Post-assessment (1-5)
            $table->unsignedTinyInteger('knowledge_gain')->nullable(); // Calculated: post - pre

            // Awareness & behavioral indicators
            $table->text('threat_recognition_notes')->nullable(); // Types of threats recognized
            $table->json('response_patterns')->nullable(); // How they respond to threats
            $table->boolean('demonstrated_behavior_change')->default(false);

            // Comparison context (for evaluating traditional vs interactive)
            $table->enum('learning_method', ['interactive_system', 'traditional', 'hybrid'])->default('interactive_system');

            $table->timestamps();
            $table->index(['user_id', 'activity_type', 'created_at']);
            $table->index(['performance_score', 'knowledge_gain']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_outcomes');
    }
};
