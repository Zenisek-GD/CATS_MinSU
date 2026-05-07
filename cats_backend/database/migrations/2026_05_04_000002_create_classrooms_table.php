<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('code')->unique(); // Unique code for QR joining
            $table->string('qr_code_path')->nullable(); // Path to generated QR code image
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
            
            $table->index('code');
            $table->index('teacher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
