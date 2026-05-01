<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_module_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('training_module_id')->constrained('training_modules')->cascadeOnDelete();
            $table->foreignId('last_topic_id')->nullable()->constrained('training_module_topics')->nullOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'training_module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_module_progress');
    }
};
