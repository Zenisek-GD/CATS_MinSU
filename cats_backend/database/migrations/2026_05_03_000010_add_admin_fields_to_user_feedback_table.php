<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_feedback', function (Blueprint $table) {
            // Admin annotation fields
            $table->text('admin_notes')->nullable()->after('would_recommend');
            $table->text('admin_result')->nullable()->after('admin_notes');
            $table->enum('status', ['pending', 'reviewed', 'flagged', 'resolved', 'archived'])->default('pending')->after('admin_result');
        });
    }

    public function down(): void
    {
        Schema::table('user_feedback', function (Blueprint $table) {
            $table->dropColumn(['admin_notes', 'admin_result', 'status']);
        });
    }
};
