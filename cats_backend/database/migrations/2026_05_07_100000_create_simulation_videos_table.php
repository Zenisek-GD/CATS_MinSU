<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_id')->constrained('simulations')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url')->nullable();   // YouTube / Drive / external link
            $table->string('video_path')->nullable();  // Locally uploaded file path
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['simulation_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_videos');
    }
};
