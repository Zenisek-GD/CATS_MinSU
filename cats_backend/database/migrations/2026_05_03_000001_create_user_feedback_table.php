<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Feedback context
            $table->enum('feedback_type', ['quiz', 'simulation', 'module', 'general', 'system'])->default('general');
            $table->foreignId('quiz_id')->nullable()->constrained('quizzes')->cascadeOnDelete();
            $table->foreignId('simulation_id')->nullable()->constrained('simulations')->cascadeOnDelete();
            $table->foreignId('training_module_id')->nullable()->constrained('training_modules')->cascadeOnDelete();

            // Likert scale ratings (1-5)
            $table->unsignedTinyInteger('usability_score')->nullable(); // How easy to use/navigate
            $table->unsignedTinyInteger('relevance_score')->nullable(); // How relevant to cybercrime awareness
            $table->unsignedTinyInteger('practicality_score')->nullable(); // How practical for real-world application
            $table->unsignedTinyInteger('engagement_score')->nullable(); // How engaging/interesting

            // Open feedback
            $table->text('comment')->nullable();
            $table->json('key_themes')->nullable(); // Machine-readable themes

            // Behavioral feedback
            $table->enum('perceived_difficulty', ['too_easy', 'easy', 'moderate', 'difficult', 'too_difficult'])->nullable();
            $table->boolean('would_recommend')->default(false);

            $table->timestamps();
            $table->index(['user_id', 'feedback_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_feedback');
    }
};
