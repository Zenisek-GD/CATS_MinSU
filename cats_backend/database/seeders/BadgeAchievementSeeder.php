<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeAchievementSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Default Badges ───
        $badges = [
            ['name' => 'Phishing Defender', 'slug' => 'phishing-defender', 'description' => 'Successfully identified phishing attempts', 'icon' => 'shield', 'condition_type' => 'quiz_complete', 'condition_value' => 1],
            ['name' => 'Malware Expert', 'slug' => 'malware-expert', 'description' => 'Demonstrated knowledge of malware threats', 'icon' => 'bug_report', 'condition_type' => 'quiz_complete', 'condition_value' => 3],
            ['name' => 'Security Champion', 'slug' => 'security-champion', 'description' => 'Achieved high scores across all categories', 'icon' => 'military_tech', 'condition_type' => 'quiz_perfect', 'condition_value' => 1],
            ['name' => 'Cyber Awareness Master', 'slug' => 'cyber-awareness-master', 'description' => 'Completed all training modules and assessments', 'icon' => 'workspace_premium', 'condition_type' => 'total_quizzes', 'condition_value' => 10],
            ['name' => 'Fast Responder', 'slug' => 'fast-responder', 'description' => 'Completed simulations quickly with correct decisions', 'icon' => 'speed', 'condition_type' => 'sim_complete', 'condition_value' => 3],
            ['name' => 'Social Engineering Guard', 'slug' => 'social-engineering-guard', 'description' => 'Identified social engineering tactics', 'icon' => 'psychology', 'condition_type' => 'quiz_complete', 'condition_value' => 2],
            ['name' => 'Password Protector', 'slug' => 'password-protector', 'description' => 'Mastered password security practices', 'icon' => 'lock', 'condition_type' => 'quiz_complete', 'condition_value' => 1],
            ['name' => 'Data Privacy Advocate', 'slug' => 'data-privacy-advocate', 'description' => 'Understanding of data privacy principles', 'icon' => 'privacy_tip', 'condition_type' => 'quiz_complete', 'condition_value' => 2],
        ];

        foreach ($badges as $badge) {
            Badge::query()->updateOrCreate(['slug' => $badge['slug']], $badge);
        }

        // ─── Default Achievements ───
        $achievements = [
            ['name' => 'Completed First Quiz', 'slug' => 'first-quiz', 'description' => 'Take and complete your first quiz', 'icon' => 'check_circle', 'xp_reward' => 50, 'condition_type' => 'first_quiz', 'condition_value' => 1],
            ['name' => 'Perfect Score', 'slug' => 'perfect-score', 'description' => 'Get a 100% score on any quiz', 'icon' => 'star', 'xp_reward' => 200, 'condition_type' => 'perfect_score', 'condition_value' => 1],
            ['name' => 'Simulation Survivor', 'slug' => 'sim-survivor', 'description' => 'Complete a simulation with a passing score', 'icon' => 'shield', 'xp_reward' => 100, 'condition_type' => 'sim_survivor', 'condition_value' => 1],
            ['name' => '7-Day Training Streak', 'slug' => 'streak-7', 'description' => 'Train for 7 consecutive days', 'icon' => 'local_fire_department', 'xp_reward' => 300, 'condition_type' => 'streak_days', 'condition_value' => 7],
            ['name' => 'Top Awareness Score', 'slug' => 'top-awareness', 'description' => 'Achieve a 90%+ average across all quizzes', 'icon' => 'emoji_events', 'xp_reward' => 500, 'condition_type' => 'top_score', 'condition_value' => 90],
            ['name' => 'Quiz Veteran', 'slug' => 'quiz-veteran', 'description' => 'Complete 20 quizzes', 'icon' => 'school', 'xp_reward' => 250, 'condition_type' => 'total_quizzes', 'condition_value' => 20],
            ['name' => 'Sim Commander', 'slug' => 'sim-commander', 'description' => 'Complete 10 simulations', 'icon' => 'security', 'xp_reward' => 250, 'condition_type' => 'total_quizzes', 'condition_value' => 10],
            ['name' => 'Getting Started', 'slug' => 'getting-started', 'description' => 'Complete your first login and profile setup', 'icon' => 'rocket_launch', 'xp_reward' => 25, 'condition_type' => 'first_quiz', 'condition_value' => 0],
        ];

        foreach ($achievements as $achievement) {
            Achievement::query()->updateOrCreate(['slug' => $achievement['slug']], $achievement);
        }
    }
}
