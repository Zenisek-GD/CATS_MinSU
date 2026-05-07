<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('classroom_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('joined_at')->useCurrent();
            $table->enum('status', ['active', 'removed'])->default('active');
            $table->timestamps();
            
            $table->unique(['classroom_id', 'student_id']);
            $table->index('classroom_id');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_students');
    }
};
