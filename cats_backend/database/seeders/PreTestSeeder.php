<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use Illuminate\Database\Seeder;

class PreTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates pre-test quizzes to assess baseline cybersecurity knowledge
     */
    public function run(): void
    {
        // Get or create category for pre-tests
        $category = QuizCategory::firstOrCreate(
            ['name' => 'Pre-Test Assessment'],
            [
                'slug' => 'pre-test-assessment',
            ]
        );

        // Pre-Test Quiz 1: Cybersecurity Awareness Basics
        $pretest1 = Quiz::firstOrCreate(
            ['title' => 'Pre-Test: Cybersecurity Awareness Basics'],
            [
                'category_id' => $category->id,
                'description' => 'Baseline assessment of cybersecurity awareness knowledge. This test helps us understand your current knowledge level before training.',
                'difficulty' => 'easy',
                'kind' => 'pretest',
                'randomize_questions' => true,
                'question_count' => 10,
                'time_limit_seconds' => 900, // 15 minutes
                'is_active' => true,
            ]
        );

        // Add questions to Pre-Test 1
        $questions1 = [
            [
                'prompt' => 'What is phishing?',
                'type' => 'multiple_choice',
                'sort_order' => 1,
                'points' => 1,
                'options' => [
                    ['text' => 'A method of catching fish online', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Fraudulent attempts to obtain sensitive information by disguising communications as trustworthy sources', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A software application for managing passwords', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A type of computer virus', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Which of the following is a strong password?',
                'type' => 'multiple_choice',
                'sort_order' => 2,
                'points' => 1,
                'options' => [
                    ['text' => '123456', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'password', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'MyP@ssw0rd2024!', 'is_correct' => true, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'qwerty', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What should you do if you receive an unexpected email requesting your password?',
                'type' => 'multiple_choice',
                'sort_order' => 3,
                'points' => 1,
                'options' => [
                    ['text' => 'Reply with your password immediately', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Click the link in the email to verify your account', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'Delete the email and contact the organization directly through official channels', 'is_correct' => true, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'Forward it to your colleagues', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Malware is software designed to harm your computer.',
                'type' => 'true_false',
                'sort_order' => 4,
                'points' => 1,
                'options' => [
                    ['text' => 'True', 'is_correct' => true, 'sort_order' => 1, 'label' => 'True'],
                    ['text' => 'False', 'is_correct' => false, 'sort_order' => 2, 'label' => 'False'],
                ],
            ],
            [
                'prompt' => 'What is social engineering?',
                'type' => 'multiple_choice',
                'sort_order' => 5,
                'points' => 1,
                'options' => [
                    ['text' => 'The practice of influencing people to disclose confidential information', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'A branch of computer science', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A type of security software', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A networking protocol', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Is it safe to use the same password for all your online accounts?',
                'type' => 'true_false',
                'sort_order' => 6,
                'points' => 1,
                'options' => [
                    ['text' => 'True', 'is_correct' => false, 'sort_order' => 1, 'label' => 'True'],
                    ['text' => 'False', 'is_correct' => true, 'sort_order' => 2, 'label' => 'False'],
                ],
            ],
            [
                'prompt' => 'What is ransomware?',
                'type' => 'multiple_choice',
                'sort_order' => 7,
                'points' => 1,
                'options' => [
                    ['text' => 'Malware that encrypts your files and demands payment for their release', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'A type of antivirus software', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A secure communication protocol', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A random number generator', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Should you click on links from unknown senders in emails?',
                'type' => 'true_false',
                'sort_order' => 8,
                'points' => 1,
                'options' => [
                    ['text' => 'True', 'is_correct' => false, 'sort_order' => 1, 'label' => 'True'],
                    ['text' => 'False', 'is_correct' => true, 'sort_order' => 2, 'label' => 'False'],
                ],
            ],
            [
                'prompt' => 'What is a VPN primarily used for?',
                'type' => 'multiple_choice',
                'sort_order' => 9,
                'points' => 1,
                'options' => [
                    ['text' => 'To increase internet speed', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'To encrypt your internet connection and mask your location', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'To block all websites', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'To store your passwords', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What should you do if you accidentally click on a suspicious link?',
                'type' => 'multiple_choice',
                'sort_order' => 10,
                'points' => 1,
                'options' => [
                    ['text' => 'Ignore it and hope nothing happens', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Immediately report it to your IT department and disconnect if necessary', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'Try to remove it yourself', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'Share it with colleagues as a warning', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
        ];

        foreach ($questions1 as $questionData) {
            $options = $questionData['options'];
            unset($questionData['options']);

            $question = QuizQuestion::firstOrCreate(
                [
                    'quiz_id' => $pretest1->id,
                    'prompt' => $questionData['prompt'],
                ],
                $questionData
            );

            foreach ($options as $optionData) {
                QuizOption::firstOrCreate(
                    [
                        'question_id' => $question->id,
                        'text' => $optionData['text'],
                    ],
                    $optionData
                );
            }
        }

        // Pre-Test Quiz 2: Advanced Threat Recognition
        $pretest2 = Quiz::firstOrCreate(
            ['title' => 'Pre-Test: Advanced Threat Recognition'],
            [
                'category_id' => $category->id,
                'description' => 'Assessment of advanced cybersecurity threat recognition capabilities. Evaluate your ability to identify sophisticated attacks.',
                'difficulty' => 'medium',
                'kind' => 'pretest',
                'randomize_questions' => true,
                'question_count' => 8,
                'time_limit_seconds' => 720, // 12 minutes
                'is_active' => true,
            ]
        );

        // Add questions to Pre-Test 2
        $questions2 = [
            [
                'prompt' => 'What is a zero-day vulnerability?',
                'type' => 'multiple_choice',
                'sort_order' => 1,
                'points' => 1,
                'options' => [
                    ['text' => 'A vulnerability that has been known for zero days (unknown to the vendor)', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'A vulnerability that cannot be exploited', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A vulnerability in the operating system only', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A type of firewall protection', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What is a man-in-the-middle (MITM) attack?',
                'type' => 'multiple_choice',
                'sort_order' => 2,
                'points' => 1,
                'options' => [
                    ['text' => 'An attack where someone intercepts communication between two parties', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'An attack that only affects mobile devices', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A type of DDoS attack', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'An attack on firewalls', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Which of the following is NOT a common social engineering technique?',
                'type' => 'multiple_choice',
                'sort_order' => 3,
                'points' => 1,
                'options' => [
                    ['text' => 'Pretexting', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Encryption', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'Baiting', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'Tailgating', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What is the purpose of two-factor authentication (2FA)?',
                'type' => 'multiple_choice',
                'sort_order' => 4,
                'points' => 1,
                'options' => [
                    ['text' => 'To slow down login processes', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'To add an extra layer of security by requiring two forms of identification', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'To prevent all cyber attacks', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'To eliminate the need for passwords', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What is a botnet?',
                'type' => 'multiple_choice',
                'sort_order' => 5,
                'points' => 1,
                'options' => [
                    ['text' => 'A network of compromised computers controlled by an attacker', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'A robot designed to protect networks', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A type of antivirus software', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A secure messaging network', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'Spear phishing is targeted phishing directed at specific individuals or organizations.',
                'type' => 'true_false',
                'sort_order' => 6,
                'points' => 1,
                'options' => [
                    ['text' => 'True', 'is_correct' => true, 'sort_order' => 1, 'label' => 'True'],
                    ['text' => 'False', 'is_correct' => false, 'sort_order' => 2, 'label' => 'False'],
                ],
            ],
            [
                'prompt' => 'What is credential stuffing?',
                'type' => 'multiple_choice',
                'sort_order' => 7,
                'points' => 1,
                'options' => [
                    ['text' => 'Automatically testing leaked credentials against multiple online services', 'is_correct' => true, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Storing credentials in a database', 'is_correct' => false, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'A password management technique', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'A firewall configuration', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
            [
                'prompt' => 'What is the first step in incident response?',
                'type' => 'multiple_choice',
                'sort_order' => 8,
                'points' => 1,
                'options' => [
                    ['text' => 'Immediately shut down all systems', 'is_correct' => false, 'sort_order' => 1, 'label' => 'A'],
                    ['text' => 'Identify and contain the threat', 'is_correct' => true, 'sort_order' => 2, 'label' => 'B'],
                    ['text' => 'Restore from backups', 'is_correct' => false, 'sort_order' => 3, 'label' => 'C'],
                    ['text' => 'Call the media', 'is_correct' => false, 'sort_order' => 4, 'label' => 'D'],
                ],
            ],
        ];

        foreach ($questions2 as $questionData) {
            $options = $questionData['options'];
            unset($questionData['options']);

            $question = QuizQuestion::firstOrCreate(
                [
                    'quiz_id' => $pretest2->id,
                    'prompt' => $questionData['prompt'],
                ],
                $questionData
            );

            foreach ($options as $optionData) {
                QuizOption::firstOrCreate(
                    [
                        'question_id' => $question->id,
                        'text' => $optionData['text'],
                    ],
                    $optionData
                );
            }
        }

        if (isset($this->command)) {
            $this->command->info('✓ Pre-Test Seeders completed successfully!');
            $this->command->info('Pre-Test Quiz 1: ' . $pretest1->title);
            $this->command->info('  - ' . $pretest1->questions()->count() . ' questions');
            $this->command->info('  - Difficulty: ' . $pretest1->difficulty);
            $this->command->info('  - Time limit: ' . ($pretest1->time_limit_seconds / 60) . ' minutes');
            $this->command->info('');
            $this->command->info('Pre-Test Quiz 2: ' . $pretest2->title);
            $this->command->info('  - ' . $pretest2->questions()->count() . ' questions');
            $this->command->info('  - Difficulty: ' . $pretest2->difficulty);
            $this->command->info('  - Time limit: ' . ($pretest2->time_limit_seconds / 60) . ' minutes');
        }
    }
}
