<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Jwt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
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

        // Safety guard: RefreshDatabase will wipe the configured database.
        if ($driver === 'mysql') {
            $dbName = (string) (getenv('DB_DATABASE') ?: '');
            if (!str_contains($dbName, 'test')) {
                $this->markTestSkipped('Refusing to run DB-destructive tests unless DB_DATABASE contains "test".');
            }
        }

        parent::setUp();
    }

    public function test_user_can_register_login_and_access_me(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'name' => 'Student One',
            'email' => 'student1@example.com',
            'password' => 'Password123!',
        ]);

        $register->assertOk();
        $token = $register->json('token');
        $this->assertIsString($token);

        $me = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/me');
        $me->assertOk();
        $me->assertJsonPath('user.email', 'student1@example.com');
        $me->assertJsonPath('user.role', 'user');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'student1@example.com',
            'password' => 'Password123!',
        ]);

        $login->assertOk();
        $this->assertIsString($login->json('token'));
    }

    public function test_admin_only_route_requires_admin_role(): void
    {
        $user = User::query()->create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'user',
        ]);

        $admin = User::query()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
        ]);

        $userToken = Jwt::issueForUser($user);
        $adminToken = Jwt::issueForUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $userToken)
            ->getJson('/api/admin/me')
            ->assertStatus(403);

        $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'admin@example.com');
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::query()->create([
            'name' => 'User',
            'email' => 'user2@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'user',
        ]);

        $token = Jwt::issueForUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me')
            ->assertStatus(401);
    }
}
