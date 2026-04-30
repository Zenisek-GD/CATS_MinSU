<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('quiz_categories')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('easy');
            $table->enum('kind', ['regular', 'pretest', 'posttest'])->default('regular');
            $table->boolean('randomize_questions')->default(true);
            $table->unsignedInteger('question_count')->default(10);
            $table->unsignedInteger('time_limit_seconds')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'kind', 'difficulty', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
