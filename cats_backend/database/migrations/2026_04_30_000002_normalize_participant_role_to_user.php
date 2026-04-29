<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('users')->where('role', 'participant')->update(['role' => 'user']);
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'user')->whereNotNull('participant_code')->update(['role' => 'participant']);
    }
};
