<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            // Track first completion and allow retakes
            $table->boolean('is_first_attempt')->default(true)->after('percent');
            $table->timestamp('first_completed_at')->nullable()->after('is_first_attempt');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn(['is_first_attempt', 'first_completed_at']);
        });
    }
};
