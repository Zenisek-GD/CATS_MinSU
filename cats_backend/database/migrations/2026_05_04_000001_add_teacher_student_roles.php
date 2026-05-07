<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // First, update existing 'user' role to 'student'
        DB::table('users')->where('role', 'user')->update(['role' => 'student']);
        
        // Then modify the column to support new roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'teacher', 'student') DEFAULT 'student'");
    }

    public function down(): void
    {
        // Revert student back to user
        DB::table('users')->where('role', 'student')->update(['role' => 'user']);
        
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(255) DEFAULT 'user'");
    }
};
