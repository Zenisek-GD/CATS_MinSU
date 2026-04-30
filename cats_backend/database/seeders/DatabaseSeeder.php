<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationStep;
use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $existingAdmin = User::query()->where('role', 'admin')->first();

        if (!$existingAdmin) {
            $email = (string) env('ADMIN_EMAIL', 'admin@example.com');
            $password = (string) env('ADMIN_PASSWORD', 'AdminPassword123!');
            $name = (string) env('ADMIN_NAME', 'Admin');

            User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'admin',
                'participant_code' => null,
            ]);
        }

        if (class_exists(TrainingModule::class) && TrainingModule::query()->count() === 0) {
            TrainingModule::query()->create(['title' => 'Password Hygiene', 'description' => 'Strong passwords and MFA basics.', 'is_active' => true]);
            TrainingModule::query()->create(['title' => 'Phishing Awareness', 'description' => 'Spot suspicious emails and links.', 'is_active' => true]);
            TrainingModule::query()->create(['title' => 'Secure Browsing', 'description' => 'Safe browsing habits and updates.', 'is_active' => true]);
        }

        if (class_exists(QuizCategory::class) && QuizCategory::query()->count() === 0) {
            $categories = [
                ['slug' => 'phishing', 'name' => 'Phishing'],
                ['slug' => 'malware', 'name' => 'Malware'],
                ['slug' => 'social-engineering', 'name' => 'Social Engineering'],
                ['slug' => 'password-security', 'name' => 'Password Security'],
                ['slug' => 'fake-websites', 'name' => 'Fake Websites'],
                ['slug' => 'online-scams', 'name' => 'Online Scams'],
                ['slug' => 'identity-theft', 'name' => 'Identity Theft'],
                ['slug' => 'ransomware', 'name' => 'Ransomware'],
                ['slug' => 'data-privacy', 'name' => 'Data Privacy'],
            ];

            foreach ($categories as $category) {
                QuizCategory::query()->create($category);
            }
        }

        if (class_exists(Quiz::class) && Quiz::query()->count() === 0) {
            $phishing = QuizCategory::query()->where('slug', 'phishing')->first();
            $password = QuizCategory::query()->where('slug', 'password-security')->first();
            $privacy = QuizCategory::query()->where('slug', 'data-privacy')->first();

            if ($phishing) {
                $quiz = Quiz::query()->create([
                    'category_id' => $phishing->id,
                    'title' => 'Phishing Basics Quiz',
                    'description' => 'Identify common phishing signs in emails and messages.',
                    'difficulty' => 'easy',
                    'kind' => 'regular',
                    'randomize_questions' => true,
                    'question_count' => 5,
                    'time_limit_seconds' => 120,
                    'is_active' => true,
                ]);

                $q1 = QuizQuestion::query()->create([
                    'quiz_id' => $quiz->id,
                    'type' => 'multiple_choice',
                    'prompt' => 'Which is a common sign of a phishing email?',
                    'explanation' => 'Phishing emails often use urgency, suspicious links, and mismatched sender domains to trick users.',
                    'points' => 1,
                    'sort_order' => 1,
                ]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'A', 'text' => 'Unexpected urgency asking you to click a link', 'is_correct' => true, 'sort_order' => 1]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'B', 'text' => 'A familiar greeting from a known colleague', 'is_correct' => false, 'sort_order' => 2]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'C', 'text' => 'An email that contains no links', 'is_correct' => false, 'sort_order' => 3]);

                $q2 = QuizQuestion::query()->create([
                    'quiz_id' => $quiz->id,
                    'type' => 'true_false',
                    'prompt' => 'True or False: It is safe to enter your password on a site if it looks like your bank website.',
                    'explanation' => 'Attackers can copy the look of a bank site. Always check the URL carefully and use official apps/bookmarks.',
                    'points' => 1,
                    'sort_order' => 2,
                ]);
                QuizOption::query()->create(['question_id' => $q2->id, 'label' => 'True', 'text' => 'True', 'is_correct' => false, 'sort_order' => 1]);
                QuizOption::query()->create(['question_id' => $q2->id, 'label' => 'False', 'text' => 'False', 'is_correct' => true, 'sort_order' => 2]);

                $q3 = QuizQuestion::query()->create([
                    'quiz_id' => $quiz->id,
                    'type' => 'scenario',
                    'prompt' => 'You receive an email: "Your account will be locked in 30 minutes" with a login button.',
                    'scenario' => "Subject: URGENT: Your account will be suspended!\nFrom: security@paypa1-support.example\n\nDear Customer,\nWe detected suspicious activity on your account. Click here immediately to verify your identity or your account will be permanently suspended within 24 hours.",
                    'explanation' => 'Do not click the button. Verify through official channels and report suspicious emails.',
                    'points' => 1,
                    'sort_order' => 3,
                ]);
                QuizOption::query()->create(['question_id' => $q3->id, 'label' => 'A', 'text' => 'Click the button and login quickly', 'is_correct' => false, 'sort_order' => 1]);
                QuizOption::query()->create(['question_id' => $q3->id, 'label' => 'B', 'text' => 'Open your bank app or type the official URL to check', 'is_correct' => true, 'sort_order' => 2]);
                QuizOption::query()->create(['question_id' => $q3->id, 'label' => 'C', 'text' => 'Reply to the email asking if it is real', 'is_correct' => false, 'sort_order' => 3]);
            }

            if ($password) {
                $quiz = Quiz::query()->create([
                    'category_id' => $password->id,
                    'title' => 'Password Security Quiz',
                    'description' => 'Test your knowledge on strong passwords and MFA.',
                    'difficulty' => 'easy',
                    'kind' => 'regular',
                    'randomize_questions' => true,
                    'question_count' => 5,
                    'time_limit_seconds' => 120,
                    'is_active' => true,
                ]);

                $q1 = QuizQuestion::query()->create([
                    'quiz_id' => $quiz->id,
                    'type' => 'multiple_choice',
                    'prompt' => 'Which password is strongest?',
                    'explanation' => 'Long, unique passphrases (and MFA) are much harder to guess or crack than short or reused passwords.',
                    'points' => 1,
                    'sort_order' => 1,
                ]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'A', 'text' => 'Password123', 'is_correct' => false, 'sort_order' => 1]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'B', 'text' => 'm1nsu', 'is_correct' => false, 'sort_order' => 2]);
                QuizOption::query()->create(['question_id' => $q1->id, 'label' => 'C', 'text' => 'Sunset-River-Notebook-71!', 'is_correct' => true, 'sort_order' => 3]);
            }

            if ($privacy) {
                Quiz::query()->create([
                    'category_id' => $privacy->id,
                    'title' => 'Pre-Test Assessment',
                    'description' => 'Pre-test before training (baseline awareness).',
                    'difficulty' => 'easy',
                    'kind' => 'pretest',
                    'randomize_questions' => true,
                    'question_count' => 5,
                    'time_limit_seconds' => 180,
                    'is_active' => true,
                ]);

                Quiz::query()->create([
                    'category_id' => $privacy->id,
                    'title' => 'Post-Test Assessment',
                    'description' => 'Post-test after training (measure improvement).',
                    'difficulty' => 'easy',
                    'kind' => 'posttest',
                    'randomize_questions' => true,
                    'question_count' => 5,
                    'time_limit_seconds' => 180,
                    'is_active' => true,
                ]);
            }
        }

        // Ensure the phishing scenario question stays aligned with the UI reference
        // (safe to run repeatedly; updates in-place, no duplicates).
        if (class_exists(Quiz::class)) {
            $phishingQuiz = Quiz::query()->where('title', 'Phishing Basics Quiz')->first();
            if ($phishingQuiz) {
                $scenarioQ = QuizQuestion::query()
                    ->where('quiz_id', $phishingQuiz->id)
                    ->where('sort_order', 3)
                    ->where('type', 'scenario')
                    ->first();

                if ($scenarioQ) {
                    $scenarioQ->scenario = "Subject: URGENT: Your account will be suspended!\nFrom: security@paypa1-support.example\n\nDear Customer,\nWe detected suspicious activity on your account. Click here immediately to verify your identity or your account will be permanently suspended within 24 hours.";
                    $scenarioQ->save();
                }
            }
        }

        if (class_exists(Simulation::class)) {
            $phishing = QuizCategory::query()->where('slug', 'phishing')->first();
            $fakeWeb = QuizCategory::query()->where('slug', 'fake-websites')->first();
            $privacy = QuizCategory::query()->where('slug', 'data-privacy')->first();

            if ($phishing) {
                $sim = Simulation::query()->firstOrCreate(
                    ['category_id' => $phishing->id, 'title' => 'Fake Phishing Email Detection'],
                    [
                        'description' => 'Decide what to do when you receive a suspicious email.',
                        'difficulty' => 'easy',
                        'time_limit_seconds' => 180,
                        'max_score' => 100,
                        'is_active' => true,
                    ]
                );

                if ($sim->steps()->count() === 0) {
                    $s1 = SimulationStep::query()->create([
                        'simulation_id' => $sim->id,
                        'step_order' => 1,
                        'title' => 'Inbox Alert',
                        'prompt' => 'Email: "URGENT: Verify your MinSU account". The message includes a link to verify your login details.',
                        'education' => 'Check the sender domain, avoid clicking unknown links, and verify through official channels.',
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Click the link and enter your password to verify',
                        'is_safe' => false,
                        'score_delta' => -40,
                        'feedback' => 'Unsafe choice. This could be a phishing site collecting credentials.',
                        'explanation' => 'Do not enter credentials from suspicious links. Use the official site/app and report the email.',
                        'sort_order' => 1,
                    ]);
                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Verify the sender and login via the official portal/app (not the email link)',
                        'is_safe' => true,
                        'score_delta' => 20,
                        'feedback' => 'Good choice. You verified safely without trusting the email link.',
                        'explanation' => 'Always verify using trusted sources (official portal/app) and report suspicious emails.',
                        'sort_order' => 2,
                    ]);
                }

                $realistic = Simulation::query()->where('category_id', $phishing->id)->where('title', 'Phishing Email: Password Expiry Notice')->first();
                if (!$realistic) {
                    $realistic = Simulation::query()->create([
                        'category_id' => $phishing->id,
                        'title' => 'Phishing Email: Password Expiry Notice',
                        'description' => 'Practice spotting a realistic-looking password expiry email (training simulation).',
                        'difficulty' => 'easy',
                        'time_limit_seconds' => 240,
                        'max_score' => 100,
                        'is_active' => true,
                    ]);

                    $p1 = SimulationStep::query()->create([
                        'simulation_id' => $realistic->id,
                        'step_order' => 1,
                        'title' => 'Inbox — New Email',
                        'prompt' => "From: MinSU IT Service Desk <it-helpdesk@mins-u-support.example>\nReply-To: it-helpdesk@mins-u-support.example\nTo: you@minsu.example\nSubject: Action Required: Password Expiring Today\n\nHello Student,\n\nOur system detected that your password will expire today. To avoid account lockout, please update your password within 30 minutes.\n\nUpdate Password: https://minsu-portal-security.example.com/verify\n\nIf you did not request this update, contact IT immediately.\n\n— MinSU IT Service Desk\nTicket Ref: #IT-20491",
                        'education' => 'Red flags: urgency, pressure, and a link with a suspicious domain. Use official portals/bookmarks and report suspicious emails.',
                    ]);

                    $p2 = SimulationStep::query()->create([
                        'simulation_id' => $realistic->id,
                        'step_order' => 2,
                        'title' => 'You Clicked the Link',
                        'prompt' => "The page looks like the MinSU portal and asks you to sign in.\n\nURL shown in the browser: https://minsu-portal-security.example.com/login\n\nIt asks for:\n- Email\n- Password\n- One-Time Code (OTP)",
                        'education' => 'A familiar-looking page can still be fake. Verify the exact domain and avoid entering credentials from email links.',
                    ]);

                    $p3 = SimulationStep::query()->create([
                        'simulation_id' => $realistic->id,
                        'step_order' => 3,
                        'title' => 'Safe Next Steps',
                        'prompt' => "What should you do now?",
                        'education' => 'Best practice: report to IT/security, delete the email, and if you clicked/entered info, change your password via the official portal and enable MFA if available.',
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p1->id,
                        'next_step_id' => $p2->id,
                        'text' => 'Click the Update Password link to avoid lockout',
                        'is_safe' => false,
                        'score_delta' => -20,
                        'feedback' => 'Risky choice. Email links can lead to credential-harvesting sites.',
                        'explanation' => 'Even if the email looks official, verify via the real portal you trust (bookmark/app).',
                        'sort_order' => 1,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p1->id,
                        'next_step_id' => $p3->id,
                        'text' => 'Do NOT click; open the official portal from a bookmark/app and report the email to IT',
                        'is_safe' => true,
                        'score_delta' => 20,
                        'feedback' => 'Great choice. You avoided a suspicious link and verified safely.',
                        'explanation' => 'Use trusted channels and report suspicious emails so others are protected too.',
                        'sort_order' => 2,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p1->id,
                        'next_step_id' => $p3->id,
                        'text' => 'Reply and ask for more details',
                        'is_safe' => false,
                        'score_delta' => -10,
                        'feedback' => 'Not recommended. Attackers may respond and pressure you further.',
                        'explanation' => 'Instead of replying, contact IT via official phone/email directory and report the message.',
                        'sort_order' => 3,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p2->id,
                        'next_step_id' => null,
                        'text' => 'Enter your email, password, and OTP on the page',
                        'is_safe' => false,
                        'score_delta' => -40,
                        'feedback' => 'Unsafe. This can give attackers your login and MFA code.',
                        'explanation' => 'Never enter credentials from a link in an unexpected email. Close it and use the official portal.',
                        'sort_order' => 1,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p2->id,
                        'next_step_id' => $p3->id,
                        'text' => 'Close the page and change your password via the official portal; report the email',
                        'is_safe' => true,
                        'score_delta' => 15,
                        'feedback' => 'Good recovery. You stopped before entering credentials and switched to official channels.',
                        'explanation' => 'If you clicked, report it and take preventive actions using official sites only.',
                        'sort_order' => 2,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p3->id,
                        'next_step_id' => null,
                        'text' => 'Report the email to IT/security using official contact details, then delete it',
                        'is_safe' => true,
                        'score_delta' => 20,
                        'feedback' => 'Excellent. Reporting helps protect the whole community.',
                        'explanation' => 'Reporting enables blocking and warnings for others, and creates awareness.',
                        'sort_order' => 1,
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $p3->id,
                        'next_step_id' => null,
                        'text' => 'Ignore the email and do nothing',
                        'is_safe' => true,
                        'score_delta' => 0,
                        'feedback' => 'Safer than clicking, but better to report it.',
                        'explanation' => 'Reporting suspicious emails helps the organization respond and prevent others from being tricked.',
                        'sort_order' => 2,
                    ]);
                }
            }

            if ($fakeWeb) {
                $sim = Simulation::query()->firstOrCreate(
                    ['category_id' => $fakeWeb->id, 'title' => 'Fake Banking Website Check'],
                    [
                        'description' => 'Spot a fake website before signing in.',
                        'difficulty' => 'easy',
                        'time_limit_seconds' => 180,
                        'max_score' => 100,
                        'is_active' => true,
                    ]
                );

                if ($sim->steps()->count() === 0) {
                    $s1 = SimulationStep::query()->create([
                        'simulation_id' => $sim->id,
                        'step_order' => 1,
                        'title' => 'Login Page',
                        'prompt' => 'A website asks you to sign in to your bank. The page looks correct but the URL is bank-secure-login.example.net.',
                        'education' => 'Look for the official domain. HTTPS does not guarantee legitimacy; avoid unknown links.',
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Proceed to login since the padlock icon is visible',
                        'is_safe' => false,
                        'score_delta' => -40,
                        'feedback' => 'Unsafe. HTTPS only encrypts traffic; it does not prove the site is the real bank.',
                        'explanation' => 'Check the exact domain and use the official app/bookmark.',
                        'sort_order' => 1,
                    ]);
                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Close the site and open the official bank app/URL you trust',
                        'is_safe' => true,
                        'score_delta' => 20,
                        'feedback' => 'Safe. You avoided entering credentials on an untrusted domain.',
                        'explanation' => 'Use official channels and verify the domain carefully.',
                        'sort_order' => 2,
                    ]);
                }
            }

            if ($privacy) {
                $sim = Simulation::query()->firstOrCreate(
                    ['category_id' => $privacy->id, 'title' => 'Unsafe Public WiFi Scenario'],
                    [
                        'description' => 'Make safe choices on a public WiFi network.',
                        'difficulty' => 'easy',
                        'time_limit_seconds' => 180,
                        'max_score' => 100,
                        'is_active' => true,
                    ]
                );

                if ($sim->steps()->count() === 0) {
                    $s1 = SimulationStep::query()->create([
                        'simulation_id' => $sim->id,
                        'step_order' => 1,
                        'title' => 'Free WiFi',
                        'prompt' => 'You connect to "FreeCafeWiFi". You need to check your email and do online banking.',
                        'education' => 'Public WiFi can be monitored. Avoid sensitive logins or use a trusted VPN and HTTPS.',
                    ]);

                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Do online banking immediately on public WiFi',
                        'is_safe' => false,
                        'score_delta' => -40,
                        'feedback' => 'Risky. Public WiFi can expose sensitive data.',
                        'explanation' => 'Avoid banking on public WiFi. Use mobile data or a trusted VPN.',
                        'sort_order' => 1,
                    ]);
                    SimulationChoice::query()->create([
                        'step_id' => $s1->id,
                        'next_step_id' => null,
                        'text' => 'Use mobile data (or VPN) for sensitive actions, and limit activity on public WiFi',
                        'is_safe' => true,
                        'score_delta' => 20,
                        'feedback' => 'Good choice. You reduced exposure on an untrusted network.',
                        'explanation' => 'Prefer mobile data/VPN for sensitive tasks and keep devices updated.',
                        'sort_order' => 2,
                    ]);
                }
            }
        }

        $this->call(SimulationEnhancedSeeder::class);
    }
}
