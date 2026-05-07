<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\TrainingModule;
use App\Models\TrainingModuleTopic;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ModuleWithPostTestSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $cat = QuizCategory::firstOrCreate(
            ['slug' => 'posttest'],
            ['name' => 'Post-Test']
        );

        $this->seedModule(
            title: 'Understanding Cybercrime in the Philippines',
            description: 'Learn about RA 10175 (Cybercrime Prevention Act), common cybercrime types, and legal consequences.',
            topics: [
                [
                    'title' => 'What is Cybercrime?',
                    'sort_order' => 1,
                    'content' => '<h2>What is Cybercrime?</h2>
<p>Cybercrime refers to any criminal activity that involves a computer, networked device, or network. In the Philippines, cybercrime is governed by <strong>Republic Act 10175</strong> — the Cybercrime Prevention Act of 2012.</p>
<h3>Common Types of Cybercrime</h3>
<ul>
  <li><strong>Hacking</strong> — unauthorized access to systems or data</li>
  <li><strong>Identity Theft</strong> — stealing personal information to impersonate someone</li>
  <li><strong>Cyber Libel</strong> — defamatory statements made online</li>
  <li><strong>Online Scams</strong> — fraudulent schemes conducted over the internet</li>
  <li><strong>Child Pornography</strong> — illegal content involving minors</li>
</ul>
<p>Understanding these categories helps you recognize when you or someone you know may be a victim.</p>',
                ],
                [
                    'title' => 'RA 10175 and Your Rights',
                    'sort_order' => 2,
                    'content' => '<h2>Republic Act 10175</h2>
<p>Signed into law on September 12, 2012, RA 10175 criminalizes offenses committed using information and communications technology.</p>
<h3>Key Provisions</h3>
<ul>
  <li>Illegal Access — imprisonment of 6 years and a day to 12 years</li>
  <li>Cybersex — imprisonment of 6 years and a day to 12 years</li>
  <li>Cyber Libel — higher penalty than ordinary libel</li>
  <li>Aiding or abetting in cybercrime is also punishable</li>
</ul>
<h3>Reporting Cybercrime</h3>
<p>You can report cybercrime to the <strong>PNP Anti-Cybercrime Group (ACG)</strong> or the <strong>NBI Cybercrime Division</strong>. Always document evidence (screenshots, URLs, messages) before reporting.</p>',
                ],
                [
                    'title' => 'Protecting Yourself from Cybercrime',
                    'sort_order' => 3,
                    'content' => '<h2>Staying Safe Online</h2>
<p>Prevention is better than cure. Here are practical steps to protect yourself:</p>
<h3>Personal Security Checklist</h3>
<ul>
  <li>✅ Use strong, unique passwords for every account</li>
  <li>✅ Enable two-factor authentication (2FA)</li>
  <li>✅ Never share personal information with unknown contacts</li>
  <li>✅ Verify links before clicking — hover to preview URLs</li>
  <li>✅ Keep your devices and apps updated</li>
  <li>✅ Use trusted antivirus and firewall software</li>
</ul>
<h3>If You Are a Victim</h3>
<p>Do not panic. Preserve evidence, change compromised passwords immediately, notify your bank if financial fraud occurred, and report to PNP-ACG or NBI Cybercrime Division.</p>',
                ],
            ],
            quizTitle: 'Cybercrime Awareness Post-Test',
            quizDescription: 'Assess your understanding of cybercrime types, RA 10175, and personal protection strategies.',
            questions: [
                ['prompt' => 'What law governs cybercrime in the Philippines?', 'options' => [
                    ['text' => 'RA 9995', 'correct' => false],
                    ['text' => 'RA 10175', 'correct' => true],
                    ['text' => 'RA 8792', 'correct' => false],
                    ['text' => 'RA 10173', 'correct' => false],
                ]],
                ['prompt' => 'Which of the following is considered cybercrime?', 'options' => [
                    ['text' => 'Sending a birthday greeting online', 'correct' => false],
                    ['text' => 'Unauthorized access to another person\'s email account', 'correct' => true],
                    ['text' => 'Streaming a licensed movie on Netflix', 'correct' => false],
                    ['text' => 'Posting a selfie on social media', 'correct' => false],
                ]],
                ['prompt' => 'Cyber libel carries a _____ penalty compared to ordinary libel.', 'options' => [
                    ['text' => 'Lower', 'correct' => false],
                    ['text' => 'Equal', 'correct' => false],
                    ['text' => 'Higher', 'correct' => true],
                    ['text' => 'No penalty', 'correct' => false],
                ]],
                ['prompt' => 'Where can you report cybercrime in the Philippines?', 'options' => [
                    ['text' => 'Bureau of Internal Revenue', 'correct' => false],
                    ['text' => 'PNP Anti-Cybercrime Group or NBI Cybercrime Division', 'correct' => true],
                    ['text' => 'Department of Education', 'correct' => false],
                    ['text' => 'Land Transportation Office', 'correct' => false],
                ]],
                ['prompt' => 'True or False: Aiding or abetting cybercrime is also punishable under RA 10175.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ]],
                ['prompt' => 'What should you do FIRST when you discover you are a cybercrime victim?', 'options' => [
                    ['text' => 'Delete all evidence to protect your privacy', 'correct' => false],
                    ['text' => 'Preserve evidence such as screenshots and URLs', 'correct' => true],
                    ['text' => 'Ignore it and hope it resolves itself', 'correct' => false],
                    ['text' => 'Retaliate against the attacker online', 'correct' => false],
                ]],
                ['prompt' => 'Identity theft means:', 'options' => [
                    ['text' => 'Losing your physical ID card', 'correct' => false],
                    ['text' => 'Stealing someone\'s personal information to impersonate them', 'correct' => true],
                    ['text' => 'Forgetting your username and password', 'correct' => false],
                    ['text' => 'Creating a new social media profile', 'correct' => false],
                ]],
                ['prompt' => 'Which action best protects your online accounts?', 'options' => [
                    ['text' => 'Using the same password for all accounts for easy memory', 'correct' => false],
                    ['text' => 'Sharing passwords only with close friends', 'correct' => false],
                    ['text' => 'Enabling two-factor authentication and using unique passwords', 'correct' => true],
                    ['text' => 'Writing passwords on a sticky note at your desk', 'correct' => false],
                ]],
                ['prompt' => 'True or False: Hovering over a link before clicking helps verify if it is safe.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ]],
                ['prompt' => 'RA 10175 was signed into law in which year?', 'options' => [
                    ['text' => '2008', 'correct' => false],
                    ['text' => '2010', 'correct' => false],
                    ['text' => '2012', 'correct' => true],
                    ['text' => '2016', 'correct' => false],
                ]],
            ],
            cat: $cat
        );

        $this->seedModule(
            title: 'Phishing and Social Engineering',
            description: 'Recognize and defend against phishing emails, smishing, vishing, and social engineering tactics.',
            topics: [
                [
                    'title' => 'What is Phishing?',
                    'sort_order' => 1,
                    'content' => '<h2>Phishing Explained</h2>
<p><strong>Phishing</strong> is a cyberattack where criminals impersonate trusted organizations to trick you into revealing sensitive information such as passwords, credit card numbers, or personal data.</p>
<h3>Common Phishing Channels</h3>
<ul>
  <li><strong>Email Phishing</strong> — fake emails from banks, government agencies, or popular services</li>
  <li><strong>Smishing</strong> — phishing via SMS/text messages</li>
  <li><strong>Vishing</strong> — voice call phishing where attackers pose as support agents</li>
  <li><strong>Spear Phishing</strong> — targeted attacks using your personal details</li>
</ul>
<h3>Red Flags in Phishing Emails</h3>
<ul>
  <li>Urgent or threatening language ("Your account will be suspended!")</li>
  <li>Mismatched or suspicious sender domains (e.g., amazon-support@gmail.com)</li>
  <li>Generic greetings ("Dear Customer" instead of your name)</li>
  <li>Unexpected attachments or links</li>
</ul>',
                ],
                [
                    'title' => 'Social Engineering Tactics',
                    'sort_order' => 2,
                    'content' => '<h2>Social Engineering</h2>
<p>Social engineering manipulates human psychology rather than exploiting technical vulnerabilities. Attackers exploit trust, fear, curiosity, or urgency.</p>
<h3>Common Tactics</h3>
<ul>
  <li><strong>Pretexting</strong> — creating a fabricated scenario to extract information (e.g., fake IT support)</li>
  <li><strong>Baiting</strong> — luring victims with something attractive (e.g., infected USB drives)</li>
  <li><strong>Quid Pro Quo</strong> — offering a service in exchange for information</li>
  <li><strong>Tailgating</strong> — physically following someone into a restricted area</li>
</ul>
<blockquote>
<p>💡 <strong>Key Insight:</strong> Social engineers exploit emotions, not systems. When something feels too urgent or too good to be true — pause and verify.</p>
</blockquote>',
                ],
                [
                    'title' => 'How to Defend Against Phishing',
                    'sort_order' => 3,
                    'content' => '<h2>Your Defense Checklist</h2>
<p>Follow these practices to significantly reduce your phishing risk:</p>
<h3>Before Clicking</h3>
<ul>
  <li>✅ Verify the sender\'s email address — check the full domain, not just the display name</li>
  <li>✅ Hover over links to preview the actual URL before clicking</li>
  <li>✅ When in doubt, navigate directly to the website by typing the URL</li>
</ul>
<h3>If You Receive a Suspicious Message</h3>
<ul>
  <li>✅ Do NOT click links or download attachments</li>
  <li>✅ Report it to your IT department or email provider</li>
  <li>✅ Delete the message</li>
</ul>
<h3>Technical Safeguards</h3>
<ul>
  <li>✅ Enable spam filters and email authentication (SPF, DKIM, DMARC)</li>
  <li>✅ Use a password manager so you only enter passwords on legitimate sites</li>
  <li>✅ Enable MFA on all important accounts</li>
</ul>',
                ],
            ],
            quizTitle: 'Phishing & Social Engineering Post-Test',
            quizDescription: 'Test your ability to identify phishing attempts and social engineering tactics.',
            questions: [
                ['prompt' => 'What is "smishing"?', 'options' => [
                    ['text' => 'Phishing via email', 'correct' => false],
                    ['text' => 'Phishing via SMS or text messages', 'correct' => true],
                    ['text' => 'Hacking via Wi-Fi', 'correct' => false],
                    ['text' => 'Voice call fraud', 'correct' => false],
                ]],
                ['prompt' => 'Which is a red flag of a phishing email?', 'options' => [
                    ['text' => 'An email from your known colleague with your name in the greeting', 'correct' => false],
                    ['text' => 'An urgent message with a link from "amazon-support@gmail.com"', 'correct' => true],
                    ['text' => 'A newsletter you subscribed to last week', 'correct' => false],
                    ['text' => 'An automated receipt from a purchase you made', 'correct' => false],
                ]],
                ['prompt' => 'Spear phishing differs from regular phishing because it:', 'options' => [
                    ['text' => 'Only targets large corporations', 'correct' => false],
                    ['text' => 'Uses personal details to craft targeted attacks', 'correct' => true],
                    ['text' => 'Only happens via phone calls', 'correct' => false],
                    ['text' => 'Requires physical access to a device', 'correct' => false],
                ]],
                ['prompt' => 'True or False: Hovering over a link shows you the actual destination URL.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ]],
                ['prompt' => 'A "pretexting" attack involves:', 'options' => [
                    ['text' => 'Installing malware on your computer', 'correct' => false],
                    ['text' => 'Creating a fabricated scenario to extract information from the target', 'correct' => true],
                    ['text' => 'Sending mass spam emails', 'correct' => false],
                    ['text' => 'Blocking access to a website', 'correct' => false],
                ]],
                ['prompt' => 'What should you do if you receive a suspicious email with an attachment?', 'options' => [
                    ['text' => 'Open the attachment to check if it is safe', 'correct' => false],
                    ['text' => 'Forward it to colleagues to warn them', 'correct' => false],
                    ['text' => 'Do NOT open it; report and delete the email', 'correct' => true],
                    ['text' => 'Reply and ask if the email is legitimate', 'correct' => false],
                ]],
                ['prompt' => '"Vishing" is phishing conducted via:', 'options' => [
                    ['text' => 'Email', 'correct' => false],
                    ['text' => 'Text messages', 'correct' => false],
                    ['text' => 'Voice/phone calls', 'correct' => true],
                    ['text' => 'Social media posts', 'correct' => false],
                ]],
                ['prompt' => 'True or False: Social engineering attacks target human psychology, not just technical systems.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => true],
                    ['text' => 'False', 'correct' => false],
                ]],
                ['prompt' => 'Which best protects you from entering credentials on a fake site?', 'options' => [
                    ['text' => 'Checking that the site has a padlock icon', 'correct' => false],
                    ['text' => 'Using a password manager that only fills forms on legitimate domains', 'correct' => true],
                    ['text' => 'Using the same password everywhere', 'correct' => false],
                    ['text' => 'Only visiting sites recommended by friends', 'correct' => false],
                ]],
                ['prompt' => '"Baiting" as a social engineering method means:', 'options' => [
                    ['text' => 'Sending urgent emails with threats', 'correct' => false],
                    ['text' => 'Luring victims with attractive items like a free USB drive that contains malware', 'correct' => true],
                    ['text' => 'Calling victims pretending to be IT support', 'correct' => false],
                    ['text' => 'Physically breaking into a server room', 'correct' => false],
                ]],
            ],
            cat: $cat
        );

        $this->seedModule(
            title: 'Password Security and Online Privacy',
            description: 'Master strong password practices, multi-factor authentication, and data privacy principles under RA 10173.',
            topics: [
                [
                    'title' => 'Creating and Managing Strong Passwords',
                    'sort_order' => 1,
                    'content' => '<h2>Password Security</h2>
<p>Passwords are your first line of defense. A weak password can be cracked in seconds using modern tools.</p>
<h3>What Makes a Strong Password?</h3>
<ul>
  <li>At least <strong>12 characters</strong> long</li>
  <li>Combination of uppercase, lowercase, numbers, and symbols</li>
  <li><strong>Unique</strong> for every account</li>
  <li>Not based on personal information (birthdays, names)</li>
</ul>
<h3>Password Best Practices</h3>
<ul>
  <li>✅ Use a <strong>passphrase</strong> — e.g., "BlueSky#Guitar2026!"</li>
  <li>✅ Use a <strong>password manager</strong> (Bitwarden, 1Password) to store unique passwords</li>
  <li>✅ Never reuse passwords across different sites</li>
  <li>✅ Change passwords immediately if a breach is suspected</li>
  <li>❌ Never share your password — not even with IT support</li>
</ul>',
                ],
                [
                    'title' => 'Multi-Factor Authentication (MFA)',
                    'sort_order' => 2,
                    'content' => '<h2>What is Multi-Factor Authentication?</h2>
<p>MFA (also called 2FA — Two-Factor Authentication) requires <strong>two or more verification steps</strong> before granting access to an account. Even if your password is stolen, MFA protects your account.</p>
<h3>MFA Factors</h3>
<ul>
  <li><strong>Something you know</strong> — password, PIN</li>
  <li><strong>Something you have</strong> — OTP via SMS, authenticator app, hardware key</li>
  <li><strong>Something you are</strong> — fingerprint, face scan</li>
</ul>
<h3>Best MFA Options (in order of security)</h3>
<ol>
  <li>Hardware security keys (e.g., YubiKey) — most secure</li>
  <li>Authenticator apps (Google Authenticator, Authy)</li>
  <li>SMS OTP — convenient but vulnerable to SIM swap attacks</li>
</ol>
<blockquote><p>💡 Always enable MFA on email, banking, and social media accounts.</p></blockquote>',
                ],
                [
                    'title' => 'Data Privacy and RA 10173',
                    'sort_order' => 3,
                    'content' => '<h2>Your Right to Data Privacy</h2>
<p>The <strong>Data Privacy Act of 2012 (RA 10173)</strong> protects personal information collected, processed, and stored by organizations in the Philippines.</p>
<h3>Your Rights Under RA 10173</h3>
<ul>
  <li><strong>Right to be Informed</strong> — know how your data is collected and used</li>
  <li><strong>Right to Access</strong> — request copies of your personal data</li>
  <li><strong>Right to Correction</strong> — have inaccurate data corrected</li>
  <li><strong>Right to Erasure</strong> — request deletion of data in certain circumstances</li>
  <li><strong>Right to Object</strong> — object to the processing of your data</li>
</ul>
<h3>Protecting Your Personal Data Online</h3>
<ul>
  <li>✅ Read privacy policies before signing up for services</li>
  <li>✅ Limit what personal information you share on social media</li>
  <li>✅ Use private/incognito mode when using shared computers</li>
  <li>✅ Regularly review app permissions on your devices</li>
</ul>',
                ],
            ],
            quizTitle: 'Password Security & Privacy Post-Test',
            quizDescription: 'Test your understanding of password best practices, MFA, and data privacy rights.',
            questions: [
                ['prompt' => 'What is the minimum recommended password length for strong security?', 'options' => [
                    ['text' => '6 characters', 'correct' => false],
                    ['text' => '8 characters', 'correct' => false],
                    ['text' => '12 characters', 'correct' => true],
                    ['text' => '4 characters', 'correct' => false],
                ]],
                ['prompt' => 'True or False: Using the same password for multiple accounts is acceptable if the password is strong.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => false],
                    ['text' => 'False', 'correct' => true],
                ]],
                ['prompt' => 'What is MFA?', 'options' => [
                    ['text' => 'A type of antivirus software', 'correct' => false],
                    ['text' => 'A verification method requiring two or more steps to access an account', 'correct' => true],
                    ['text' => 'A password generator tool', 'correct' => false],
                    ['text' => 'A firewall configuration method', 'correct' => false],
                ]],
                ['prompt' => 'Which MFA method is generally considered the MOST secure?', 'options' => [
                    ['text' => 'SMS one-time password', 'correct' => false],
                    ['text' => 'Email verification code', 'correct' => false],
                    ['text' => 'Hardware security key (e.g., YubiKey)', 'correct' => true],
                    ['text' => 'Security questions', 'correct' => false],
                ]],
                ['prompt' => 'What Philippine law protects personal data collected by organizations?', 'options' => [
                    ['text' => 'RA 10175', 'correct' => false],
                    ['text' => 'RA 10173', 'correct' => true],
                    ['text' => 'RA 8792', 'correct' => false],
                    ['text' => 'RA 9995', 'correct' => false],
                ]],
                ['prompt' => 'Under RA 10173, which right allows you to request deletion of your personal data?', 'options' => [
                    ['text' => 'Right to Access', 'correct' => false],
                    ['text' => 'Right to Correction', 'correct' => false],
                    ['text' => 'Right to Erasure', 'correct' => true],
                    ['text' => 'Right to Object', 'correct' => false],
                ]],
                ['prompt' => 'Which is an example of a strong passphrase?', 'options' => [
                    ['text' => 'password123', 'correct' => false],
                    ['text' => 'JohnSmith1990', 'correct' => false],
                    ['text' => 'BlueSky#Guitar2026!', 'correct' => true],
                    ['text' => '12345678', 'correct' => false],
                ]],
                ['prompt' => 'True or False: You should share your password with IT support if they ask for it to fix your account.', 'type' => 'true_false', 'options' => [
                    ['text' => 'True', 'correct' => false],
                    ['text' => 'False', 'correct' => true],
                ]],
                ['prompt' => 'A password manager helps you by:', 'options' => [
                    ['text' => 'Automatically changing passwords when sites are hacked', 'correct' => false],
                    ['text' => 'Storing unique passwords for every site securely', 'correct' => true],
                    ['text' => 'Scanning your device for viruses', 'correct' => false],
                    ['text' => 'Blocking phishing websites automatically', 'correct' => false],
                ]],
                ['prompt' => 'SMS-based OTP is vulnerable to which attack?', 'options' => [
                    ['text' => 'SQL Injection', 'correct' => false],
                    ['text' => 'SIM Swap attacks', 'correct' => true],
                    ['text' => 'Denial of Service', 'correct' => false],
                    ['text' => 'Cross-site scripting', 'correct' => false],
                ]],
            ],
            cat: $cat
        );
    }

    private function seedModule(
        string $title,
        string $description,
        array $topics,
        string $quizTitle,
        string $quizDescription,
        array $questions,
        QuizCategory $cat
    ): void {
        // Create the post-test quiz first
        $quiz = Quiz::firstOrCreate(
            ['title' => $quizTitle],
            [
                'category_id'         => $cat->id,
                'description'         => $quizDescription,
                'difficulty'          => 'easy',
                'kind'                => 'posttest',
                'randomize_questions' => true,
                'question_count'      => count($questions),
                'time_limit_seconds'  => 600,
                'is_active'           => true,
            ]
        );

        // Create questions and options
        if ($quiz->questions()->count() === 0) {
            foreach ($questions as $i => $q) {
                $type = $q['type'] ?? 'multiple_choice';
                $question = QuizQuestion::create([
                    'quiz_id'    => $quiz->id,
                    'type'       => $type,
                    'prompt'     => $q['prompt'],
                    'points'     => 1,
                    'sort_order' => $i + 1,
                ]);

                foreach ($q['options'] as $j => $opt) {
                    QuizOption::create([
                        'question_id' => $question->id,
                        'label'       => chr(65 + $j),
                        'text'        => $opt['text'],
                        'is_correct'  => $opt['correct'],
                        'sort_order'  => $j + 1,
                    ]);
                }
            }
        }

        // Create the module and link the quiz
        $module = TrainingModule::firstOrCreate(
            ['title' => $title],
            [
                'description' => $description,
                'is_active'   => true,
                'quiz_id'     => $quiz->id,
            ]
        );

        // Ensure quiz_id is set (in case module already existed without it)
        if (!$module->quiz_id) {
            $module->update(['quiz_id' => $quiz->id]);
        }

        // Create topics
        foreach ($topics as $topic) {
            TrainingModuleTopic::firstOrCreate(
                ['training_module_id' => $module->id, 'title' => $topic['title']],
                ['content' => $topic['content'], 'sort_order' => $topic['sort_order']]
            );
        }
    }
}
