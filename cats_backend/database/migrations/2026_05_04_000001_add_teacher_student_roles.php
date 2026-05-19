<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // First, update existing 'user' role to 'student'
        DB::table('users')->where('role', 'user')->update(['role' => 'student']);

        // Update the column default (role stays as string; validation at app level)
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->change();
        });
    }

    public function down(): void
    {
        // Revert student back to user
        DB::table('users')->where('role', 'student')->update(['role' => 'user']);

        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->change();
        });
    }
};
