<?php

namespace Tests\Feature;

use App\Models\TrainingModule;
use App\Models\User;
use App\Support\Jwt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        $driver = getenv('DB_CONNECTION') ?: 'sqlite';

        if ($driver === 'mysql' && !extension_loaded('pdo_mysql')) {
            $this->markTestSkipped('pdo_mysql extension is required to run these tests with MySQL.');
        }

        if ($driver === 'sqlite' && !extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('pdo_sqlite extension is required to run these tests with SQLite.');
        }

        if ($driver === 'mysql') {
            $dbName = (string) (getenv('DB_DATABASE') ?: '');
            if (!str_contains($dbName, 'test')) {
                $this->markTestSkipped('Refusing to run DB-destructive tests unless DB_DATABASE contains "test".');
            }
        }

        parent::setUp();
    }

    public function test_user_dashboard_requires_auth(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_user_dashboard_returns_expected_fields(): void
    {
        TrainingModule::query()->create(['title' => 'Module A', 'description' => null, 'is_active' => true]);

        $user = User::query()->create([
            'name' => 'User',
            'email' => 'user_dash@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'user',
        ]);

        $token = Jwt::issueForUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'welcome',
                'training_progress' => ['completed_modules', 'total_modules', 'percent'],
                'quiz_scores',
                'simulation_completion_percent',
                'cyber_awareness_level',
                'badges',
                'certificates',
                'recent_activities',
                'notifications',
            ]);
    }

    public function test_admin_dashboard_is_admin_only(): void
    {
        $user = User::query()->create([
            'name' => 'User',
            'email' => 'user_no_admin@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'user',
        ]);

        $token = Jwt::issueForUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/dashboard')
            ->assertStatus(403);
    }

    public function test_admin_dashboard_returns_expected_fields(): void
    {
        $admin = User::query()->create([
            'name' => 'Admin',
            'email' => 'admin_dash@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
        ]);

        $token = Jwt::issueForUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'totals' => ['total_users', 'active_participants', 'average_quiz_score'],
                'most_failed_cyber_threats',
                'user_analytics' => ['roles' => ['admin', 'user']],
                'system_reports',
                'training_modules' => ['total', 'active'],
            ]);
    }
}
