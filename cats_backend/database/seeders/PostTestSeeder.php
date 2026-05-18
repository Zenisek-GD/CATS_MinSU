<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use Illuminate\Database\Seeder;

/**
 * Post-Test Seeder
 *
 * Creates a 10-question post-test that mirrors the Pre-Test topics so students
 * can demonstrate growth after completing the learning modules.
 *
 * The post-test is locked in the UI until the student completes all pre-tests
 * (see QuizzesPage.tsx → pretestDone logic).
 */
class PostTestSeeder extends Seeder
{
    public function run(): void
    {
        // Reuse the same category as the PreTestSeeder
        $category = QuizCategory::firstOrCreate(
            ['name' => 'Pre-Test Assessment'],
            ['slug' => 'pre-test-assessment']
        );

        // Also try to update the stub "Post-Test Assessment" created by DatabaseSeeder
        // (it exists but has no questions). We'll adopt it rather than create a duplicate.
        $posttest = Quiz::firstOrCreate(
            ['title' => 'Post-Test: Cybersecurity Awareness'],
            [
                'category_id'         => $category->id,
                'description'         => 'Take this AFTER completing the learning modules to measure your improvement. Topics mirror the Pre-Test so you can see your growth.',
                'difficulty'          => 'easy',
                'kind'                => 'posttest',
                'randomize_questions' => true,
                'question_count'      => 10,
                'time_limit_seconds'  => 900, // 15 minutes
                'is_active'           => true,
            ]
        );

        // Also fix the stub quiz from DatabaseSeeder if it exists and has no questions
        $stub = Quiz::where('title', 'Post-Test Assessment')
            ->where('kind', 'posttest')
            ->first();

        if ($stub && $stub->questions()->count() === 0) {
            // Point the stub to our real seeded post-test by merging (just update title/description)
            $stub->update([
                'description'    => 'Post-test after training — measures your improvement after completing learning modules.',
                'question_count' => 10,
            ]);
        }

        // --- Questions ---
        $questions = [
            [
                'prompt'     => 'Which of the following BEST describes phishing?',
                'type'       => 'multiple_choice',
                'sort_order' => 1,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'A method attackers use to trick users into revealing sensitive information through deceptive messages', 'is_correct' => true,  'sort_order' => 1],
                    ['label' => 'B', 'text' => 'A technique for safely encrypting email attachments',                                                  'is_correct' => false, 'sort_order' => 2],
                    ['label' => 'C', 'text' => 'A type of firewall that blocks malicious traffic',                                                     'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'A network scanning tool used by IT administrators',                                                    'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'What makes a password most secure?',
                'type'       => 'multiple_choice',
                'sort_order' => 2,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Using your name followed by your birth year',                                              'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'A long passphrase mixing uppercase, lowercase, numbers, and symbols (e.g. Tr@il-Sun7!now)', 'is_correct' => true,  'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Reusing the same password across all accounts for easy memory',                            'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'A short word with capital first letter',                                                   'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'An email from "support@paypa1-secure.net" asks you to verify your account urgently. What should you do?',
                'type'       => 'multiple_choice',
                'sort_order' => 3,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Click the link immediately to avoid account suspension',                                           'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Reply to the email asking for more information',                                                    'is_correct' => false, 'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Ignore the domain mismatch and proceed if the page looks right',                                   'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Do not click the link; go directly to the official site and report the email to IT or the service', 'is_correct' => true,  'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'Ransomware primarily works by:',
                'type'       => 'multiple_choice',
                'sort_order' => 4,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Slowing down the computer until a payment is made',                          'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Encrypting the victim\'s files and demanding payment for the decryption key', 'is_correct' => true,  'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Deleting system files to force a reinstall',                                 'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Stealing browsing history and selling it to advertisers',                    'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'Social engineering attacks rely on:',
                'type'       => 'multiple_choice',
                'sort_order' => 5,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Exploiting software bugs in the operating system',                        'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Cracking passwords using brute-force algorithms',                         'is_correct' => false, 'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Manipulating people psychologically to gain access or sensitive information', 'is_correct' => true,  'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Installing hardware keyloggers on physical machines',                      'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'Using the same password for multiple accounts is safe as long as the password is very strong.',
                'type'       => 'true_false',
                'sort_order' => 6,
                'points'     => 1,
                'options'    => [
                    ['label' => 'True',  'text' => 'True',  'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'False', 'text' => 'False', 'is_correct' => true,  'sort_order' => 2],
                ],
            ],
            [
                'prompt'     => 'A VPN (Virtual Private Network) helps protect your data by:',
                'type'       => 'multiple_choice',
                'sort_order' => 7,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Blocking all advertisements and pop-ups',                                   'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Encrypting your internet traffic and masking your IP address',              'is_correct' => true,  'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Scanning files for viruses before they download',                           'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Automatically updating all your apps to the latest versions',               'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'Two-factor authentication (2FA) provides extra security because it requires:',
                'type'       => 'multiple_choice',
                'sort_order' => 8,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Two passwords entered simultaneously',                                                         'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'A password AND a second factor (e.g. OTP code, biometric) to verify identity',                 'is_correct' => true,  'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Two devices to be connected at the same time',                                                 'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Answering two security questions',                                                             'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'You are connected to public Wi-Fi at a cafe. You need to do online banking. The SAFEST action is:',
                'type'       => 'multiple_choice',
                'sort_order' => 9,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Proceed normally since you are using HTTPS',                                   'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Use mobile data or a trusted VPN for banking; avoid sensitive tasks on public Wi-Fi', 'is_correct' => true,  'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Connect only if the Wi-Fi has a password',                                    'is_correct' => false, 'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Use incognito/private mode to hide your activity',                            'is_correct' => false, 'sort_order' => 4],
                ],
            ],
            [
                'prompt'     => 'When you accidentally click a suspicious link, the FIRST thing you should do is:',
                'type'       => 'multiple_choice',
                'sort_order' => 10,
                'points'     => 1,
                'options'    => [
                    ['label' => 'A', 'text' => 'Close the browser tab and continue normally',                                                       'is_correct' => false, 'sort_order' => 1],
                    ['label' => 'B', 'text' => 'Try to remove the malware yourself by deleting files',                                              'is_correct' => false, 'sort_order' => 2],
                    ['label' => 'C', 'text' => 'Immediately disconnect from the internet, report to IT, and follow incident response steps',         'is_correct' => true,  'sort_order' => 3],
                    ['label' => 'D', 'text' => 'Share the link with colleagues to warn them',                                                        'is_correct' => false, 'sort_order' => 4],
                ],
            ],
        ];

        foreach ($questions as $qData) {
            $options = $qData['options'];
            unset($qData['options']);

            $question = QuizQuestion::firstOrCreate(
                [
                    'quiz_id' => $posttest->id,
                    'prompt'  => $qData['prompt'],
                ],
                $qData
            );

            foreach ($options as $opt) {
                QuizOption::firstOrCreate(
                    [
                        'question_id' => $question->id,
                        'text'        => $opt['text'],
                    ],
                    $opt
                );
            }
        }

        // Update question_count to match reality
        $posttest->update(['question_count' => $posttest->questions()->count()]);

        if (isset($this->command)) {
            $this->command->info('✓ PostTestSeeder completed!');
            $this->command->info('  Post-Test: ' . $posttest->title);
            $this->command->info('  Questions: ' . $posttest->questions()->count());
        }
    }
}
