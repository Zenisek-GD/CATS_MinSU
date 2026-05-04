<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\TrainingModule;
use App\Models\TrainingModuleTopic;
use App\Models\User;
use App\Models\UserModuleProgress;
use App\Models\UserFeedback;
use App\Models\LearningOutcome;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TrainingModuleSampleDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create the main training module
        $module = TrainingModule::query()->firstOrCreate([
            'title' => 'Introduction to Cybersecurity',
        ], [
            'description' => 'A comprehensive introduction to cybersecurity fundamentals, covering essential topics for recognizing and mitigating common cyber threats in the workplace. This interactive training combines real-world scenarios with practical knowledge.',
            'is_active' => true,
        ]);

        // Create the 3 topics for the module
        $topic1 = TrainingModuleTopic::query()->firstOrCreate([
            'training_module_id' => $module->id,
            'title' => 'Phishing & Email Security',
        ], [
            'content' => json_encode([
                'description' => 'Learn to identify phishing emails, suspicious links, and social engineering tactics. Covers email authentication protocols (SPF, DKIM, DMARC).',
                'duration_minutes' => 15,
                'content_type' => 'Interactive Content + Simulation',
                'sections' => [
                    '1.1 Understanding Phishing Attacks',
                    '1.2 Email Authentication Protocols',
                    '1.3 Identifying Suspicious Emails',
                    '1.4 Interactive Simulation',
                    '1.5 Best Practices'
                ]
            ]),
            'sort_order' => 1,
        ]);

        $topic2 = TrainingModuleTopic::query()->firstOrCreate([
            'training_module_id' => $module->id,
            'title' => 'Password Security & Account Protection',
        ], [
            'content' => json_encode([
                'description' => 'Master password creation strategies, multi-factor authentication (MFA), and protection against credential attacks.',
                'duration_minutes' => 15,
                'content_type' => 'Interactive Content + Simulation',
                'sections' => [
                    '2.1 Password Vulnerabilities',
                    '2.2 Creating Strong Passwords',
                    '2.3 Multi-Factor Authentication (MFA)',
                    '2.4 Account Recovery Procedures',
                    '2.5 Interactive Simulation'
                ]
            ]),
            'sort_order' => 2,
        ]);

        $topic3 = TrainingModuleTopic::query()->firstOrCreate([
            'training_module_id' => $module->id,
            'title' => 'Ransomware Recognition & Incident Response',
        ], [
            'content' => json_encode([
                'description' => 'Understand ransomware spread, recognize warning signs, and execute proper incident response procedures.',
                'duration_minutes' => 15,
                'content_type' => 'Interactive Content + Simulation',
                'sections' => [
                    '3.1 Ransomware Basics & Types',
                    '3.2 Attack Vectors',
                    '3.3 Warning Signs',
                    '3.4 Incident Response Steps',
                    '3.5 Interactive Simulation',
                    '3.6 Prevention Best Practices'
                ]
            ]),
            'sort_order' => 3,
        ]);

        // Get or create a category for the quiz
        $category = QuizCategory::query()->firstOrCreate([
            'slug' => 'cybersecurity-awareness',
        ], [
            'name' => 'Cybersecurity Awareness',
        ]);

        // Create a quiz for the module
        $quiz = Quiz::query()->firstOrCreate([
            'title' => 'Cybersecurity Awareness Assessment',
        ], [
            'category_id' => $category->id,
            'description' => 'Test your knowledge of cybersecurity fundamentals. 15 questions covering all three topics.',
            'difficulty' => 'medium',
            'kind' => 'regular',
            'randomize_questions' => true,
            'question_count' => 15,
            'time_limit_seconds' => 600,
            'is_active' => true,
        ]);

        // Create quiz questions
        $this->createQuizQuestions($quiz);

        // Create sample users and their data
        $this->createSampleUsers($module, $topic1, $topic2, $topic3, $quiz);
    }

    private function createQuizQuestions(Quiz $quiz): void
    {
        $questions = [
            [
                'prompt' => 'Which of these emails is a phishing attempt?',
                'type' => 'multiple_choice',
                'options' => [
                    ['text' => 'Email from noreply@amazon.com about a package', 'is_correct' => false],
                    ['text' => 'Email from amazon-security@amazon.co.uk with urgent link', 'is_correct' => true],
                    ['text' => 'Email from shipping-notification@amazon.com with tracking', 'is_correct' => false],
                    ['text' => 'Email from orders@amazon.com with invoice', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'Which password meets strong security requirements?',
                'type' => 'multiple_choice',
                'options' => [
                    ['text' => 'MyPassword123!', 'is_correct' => false],
                    ['text' => 'Password@2026', 'is_correct' => false],
                    ['text' => 'BlueSky#Guitar2026!', 'is_correct' => true],
                    ['text' => 'Work123Password', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'What should you do first if you see a ransomware warning on your screen?',
                'type' => 'multiple_choice',
                'options' => [
                    ['text' => 'Try to pay the ransom quickly', 'is_correct' => false],
                    ['text' => 'Turn off computer immediately', 'is_correct' => false],
                    ['text' => 'Disconnect network and notify IT immediately', 'is_correct' => true],
                    ['text' => 'Try to find a decryption tool online', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'What does MFA stand for?',
                'type' => 'multiple_choice',
                'options' => [
                    ['text' => 'Minimum File Access', 'is_correct' => false],
                    ['text' => 'Multi-Factor Authentication', 'is_correct' => true],
                    ['text' => 'Multiple Failure Alert', 'is_correct' => false],
                    ['text' => 'Major File Authorization', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'Which is NOT a warning sign of ransomware?',
                'type' => 'multiple_choice',
                'options' => [
                    ['text' => 'File extensions changing to .locked', 'is_correct' => false],
                    ['text' => 'System performing slowly', 'is_correct' => false],
                    ['text' => 'Receiving a new software update', 'is_correct' => true],
                    ['text' => 'Ransom note appearing on screen', 'is_correct' => false],
                ],
            ],
        ];

        foreach ($questions as $index => $questionData) {
            $options = $questionData['options'];
            unset($questionData['options']);

            $question = QuizQuestion::query()->firstOrCreate([
                'quiz_id' => $quiz->id,
                'prompt' => $questionData['prompt'],
            ], [
                'type' => $questionData['type'],
                'sort_order' => $index + 1,
            ]);

            foreach ($options as $optionIndex => $optionData) {
                QuizOption::query()->firstOrCreate([
                    'question_id' => $question->id,
                    'text' => $optionData['text'],
                ], [
                    'is_correct' => $optionData['is_correct'],
                    'sort_order' => $optionIndex + 1,
                ]);
            }
        }
    }

    private function createSampleUsers($module, $topic1, $topic2, $topic3, $quiz): void
    {
        $sampleUsers = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@example.com',
                'phishing_score_before' => 45,
                'phishing_score_after' => 80,
                'password_score_before' => 38,
                'password_score_after' => 92,
                'ransomware_score_before' => 28,
                'ransomware_score_after' => 84,
                'engagement_level' => 0.85,
                'behavior_change' => true,
                'would_recommend' => true,
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'phishing_score_before' => 52,
                'phishing_score_after' => 85,
                'password_score_before' => 35,
                'password_score_after' => 92,
                'ransomware_score_before' => 31,
                'ransomware_score_after' => 88,
                'engagement_level' => 0.88,
                'behavior_change' => true,
                'would_recommend' => true,
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'phishing_score_before' => 40,
                'phishing_score_after' => 78,
                'password_score_before' => 42,
                'password_score_after' => 88,
                'ransomware_score_before' => 28,
                'ransomware_score_after' => 84,
                'engagement_level' => 0.87,
                'behavior_change' => true,
                'would_recommend' => true,
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@example.com',
                'phishing_score_before' => 48,
                'phishing_score_after' => 82,
                'password_score_before' => 41,
                'password_score_after' => 89,
                'ransomware_score_before' => 35,
                'ransomware_score_after' => 81,
                'engagement_level' => 0.82,
                'behavior_change' => true,
                'would_recommend' => true,
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.wilson@example.com',
                'phishing_score_before' => 38,
                'phishing_score_after' => 76,
                'password_score_before' => 36,
                'password_score_after' => 84,
                'ransomware_score_before' => 26,
                'ransomware_score_after' => 79,
                'engagement_level' => 0.79,
                'behavior_change' => false,
                'would_recommend' => true,
            ],
        ];

        foreach ($sampleUsers as $userData) {
            // Create or find user
            $user = User::query()->firstOrCreate([
                'email' => $userData['email'],
            ], [
                'name' => $userData['name'],
                'password' => bcrypt('password123'),
                'role' => 'user',
                'participant_code' => strtoupper(substr(md5($userData['email']), 0, 8)),
            ]);

            // Create module progress
            UserModuleProgress::query()->firstOrCreate([
                'user_id' => $user->id,
                'training_module_id' => $module->id,
            ], [
                'is_completed' => true,
            ]);

            // Create feedback entries
            $feedbackTopics = [
                ['activity_type' => 'module', 'activity_id' => $module->id, 'usability' => rand(4, 5), 'relevance' => rand(4, 5)],
            ];

            foreach ($feedbackTopics as $feedback) {
                UserFeedback::query()->firstOrCreate([
                    'user_id' => $user->id,
                    'feedback_type' => $feedback['activity_type'],
                    'training_module_id' => $feedback['activity_id'],
                ], [
                    'usability_score' => $feedback['usability'],
                    'relevance_score' => $feedback['relevance'],
                    'practicality_score' => rand(4, 5),
                    'engagement_score' => rand(4, 5),
                    'comment' => $this->generateFeedbackComment(),
                    'perceived_difficulty' => collect(['easy', 'moderate', 'moderate', 'difficult'])->random(),
                    'would_recommend' => $userData['would_recommend'],
                    'key_themes' => json_encode(['practical' => true, 'engaging' => true, 'relevant' => true]),
                ]);
            }

            // Create learning outcomes
            $knowledgeGain1 = $userData['phishing_score_after'] - $userData['phishing_score_before'];
            $knowledgeGain2 = $userData['password_score_after'] - $userData['password_score_before'];
            $knowledgeGain3 = $userData['ransomware_score_after'] - $userData['ransomware_score_before'];

            LearningOutcome::query()->firstOrCreate([
                'user_id' => $user->id,
                'activity_type' => 'module_completion',
                'training_module_id' => $module->id,
            ], [
                'performance_score' => round(($userData['phishing_score_after'] + $userData['password_score_after'] + $userData['ransomware_score_after']) / 3),
                'engagement_level' => $userData['engagement_level'],
                'time_spent_seconds' => rand(2400, 3600),
                'interactions_summary' => json_encode([
                    'simulations_completed' => 3,
                    'quiz_attempts' => 1,
                    'topic_revisits' => rand(0, 2),
                ]),
                'is_completed' => true,
                'knowledge_level_pre' => 2,
                'knowledge_level_post' => 4,
                'knowledge_gain' => round(($knowledgeGain1 + $knowledgeGain2 + $knowledgeGain3) / 3 / 10),
                'threat_recognition_notes' => 'Participant successfully identified phishing, password vulnerabilities, and ransomware warnings.',
                'response_patterns' => json_encode([
                    'phishing_detection_accuracy' => round($userData['phishing_score_after'] / 100, 2),
                    'password_strength_understanding' => round($userData['password_score_after'] / 100, 2),
                    'ransomware_response_speed' => 'fast',
                ]),
                'demonstrated_behavior_change' => $userData['behavior_change'],
                'learning_method' => 'interactive_system',
            ]);

            // Create quiz attempt
            $score = rand(70, 100);
            $maxScore = 100;
            $quizAttempt = QuizAttempt::query()->create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'status' => 'completed',
                'score' => $score,
                'max_score' => $maxScore,
                'percent' => ($score / $maxScore) * 100,
                'started_at' => now()->subDays(rand(1, 5))->subHours(rand(0, 5)),
                'finished_at' => now()->subDays(rand(0, 5)),
            ]);

            // Create quiz attempt answers for the sample questions
            $questions = $quiz->questions()->get();
            foreach ($questions as $question) {
                $correctOption = $question->options()->where('is_correct', true)->first();
                QuizAttemptAnswer::query()->create([
                    'attempt_id' => $quizAttempt->id,
                    'question_id' => $question->id,
                    'selected_option_id' => $correctOption->id,
                    'is_correct' => true,
                ]);
            }
        }
    }

    private function generateFeedbackComment(): string
    {
        $comments = [
            'This simulation was incredibly realistic and practical!',
            'Finally, a cybersecurity course that feels relevant to real threats.',
            'Loved the interactive nature. Makes learning stick.',
            'Great content with real-world scenarios.',
            'Very engaging and easy to understand.',
            'The feedback on simulations was helpful.',
            'Excellent introduction to cybersecurity.',
            'Would definitely recommend to colleagues.',
        ];

        return $comments[array_rand($comments)];
    }
}
