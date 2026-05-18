<?php

namespace Database\Seeders;

use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationStep;
use App\Models\SimulationVideo;
use App\Models\QuizCategory;
use Illuminate\Database\Seeder;

class SimulationWithVideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates realistic simulations with embedded video URLs for enhanced learning
     */
    public function run(): void
    {
        // Get or create category for simulations
        $category = QuizCategory::firstOrCreate(
            ['name' => 'Cyber Threat Simulations'],
            [
                'slug' => 'cyber-threat-simulations',
            ]
        );

        // ─────────────────────────────────────────────────────────────
        // Simulation 1: Phishing Email Detection with Video Tutorial
        // ─────────────────────────────────────────────────────────────
        $simulation1 = Simulation::updateOrCreate(
            ['title' => 'Phishing Email Detection Simulation'],
            [
                'category_id' => $category->id,
                'description' => 'Learn to identify phishing emails with realistic examples and video guidance. You\'ll analyze suspect emails and make decisions about whether to report, delete, or open them.',
                'difficulty' => 'easy',
                'time_limit_seconds' => 1200, // 20 minutes
                'max_score' => 100,
                'is_active' => true,
            ]
        );

        // Add instructional videos for Simulation 1
        SimulationVideo::updateOrCreate(
            [
                'simulation_id' => $simulation1->id,
                'title' => 'How to Identify Phishing Emails',
            ],
            [
                'description' => 'Introduction to phishing attacks and common indicators. Learn what to look for in suspicious emails.',
                'video_url' => 'https://www.youtube.com/watch?v=iHetr8xTWIU',
                'sort_order' => 1,
            ]
        );

        SimulationVideo::updateOrCreate(
            [
                'simulation_id' => $simulation1->id,
                'title' => 'Email Header Analysis',
            ],
            [
                'description' => 'Deep dive into email headers and how to verify sender authenticity.',
                'video_url' => 'https://www.youtube.com/watch?v=jLSRXEScqVI',
                'sort_order' => 2,
            ]
        );

        // Add simulation steps for Simulation 1
        $steps1 = [
            [
                'step_order' => 1,
                'title' => 'Email Analysis #1: Urgent Account Verification',
                'prompt' => "From: security-verification@paypa1.com\nSubject: URGENT: Verify Your PayPal Account Now!\n\nDear Valued Customer,\n\nWe have detected unusual activity on your PayPal account. Please click the link below to verify your identity immediately:\n\nhttps://paypa1-verify.example.com/secure\n\nFailure to verify within 24 hours will result in account suspension.\n\nPayPal Security Team",
                'education' => 'Red flags: The sender domain is "paypa1.com" (not "paypal.com"). Urgent language and threats are classic phishing tactics. Never click links from suspicious emails — go to the official site directly.',
            ],
            [
                'step_order' => 2,
                'title' => 'Email Analysis #2: Invoice from Supplier',
                'prompt' => "From: accounting@trusted-supplier.com\nSubject: Invoice #INV-2026-05-001\n\nHi,\n\nPlease find attached the invoice for our latest shipment. Please process for payment.\n\nThank you.\n\n[Attachment: invoice.pdf.exe]",
                'education' => 'Red flag: The attachment is "invoice.pdf.exe" — a dangerous executable disguised as a PDF. Even from a legitimate-looking sender, never open unexpected executable files. Always verify with the sender by phone before opening attachments.',
            ],
            [
                'step_order' => 3,
                'title' => 'Email Analysis #3: Legitimate IT Update',
                'prompt' => "From: it-helpdesk@company.com\nSubject: Mandatory Security Patch Available\n\nA critical security patch is available for your system.\n\nTo install: open your browser and go to https://company.com/updates (do not use links from emails if you\'re unsure).\n\nThis update requires a restart. For support, contact the IT Helpdesk at ext. 1234.",
                'education' => 'Legitimate indicators: recognizable helpdesk address, a clear internal helpdesk contact, and an official company domain. Even so, safest practice is to navigate to known URLs directly or verify with IT before installing updates.',
            ],
        ];

        $stepModels1 = [];
        foreach ($steps1 as $stepData) {
            $step = SimulationStep::updateOrCreate(
                [
                    'simulation_id' => $simulation1->id,
                    'step_order' => $stepData['step_order'],
                ],
                $stepData
            );
            $stepModels1[(int) $stepData['step_order']] = $step;
        }

        // Seed realistic choices so the simulation is playable.
        $step1 = $stepModels1[1] ?? null;
        $step2 = $stepModels1[2] ?? null;
        $step3 = $stepModels1[3] ?? null;

        if ($step1 && $step2 && $step3) {
            SimulationChoice::query()->where('step_id', $step1->id)->delete();
            SimulationChoice::query()->where('step_id', $step2->id)->delete();
            SimulationChoice::query()->where('step_id', $step3->id)->delete();

            SimulationChoice::query()->create([
                'step_id' => $step1->id,
                'next_step_id' => $step2->id,
                'text' => 'REPORT: Use the company “Report Phishing” button / forward to security',
                'is_safe' => true,
                'score_delta' => 20,
                'feedback' => 'Good call — reporting helps protect everyone.',
                'explanation' => 'Reporting suspicious emails lets IT/security block the sender, warn others, and investigate. Avoid interacting with links or attachments in the message.',
                'sort_order' => 1,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step1->id,
                'next_step_id' => $step2->id,
                'text' => 'DELETE: Delete the email without clicking anything',
                'is_safe' => true,
                'score_delta' => 10,
                'feedback' => 'Safer than clicking — but reporting is better.',
                'explanation' => 'Deleting prevents immediate harm, but it misses the chance to alert the team and help block the campaign. When possible, report first, then delete.',
                'sort_order' => 2,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step1->id,
                'next_step_id' => $step2->id,
                'text' => 'CLICK: Open the “verify account” link',
                'is_safe' => false,
                'score_delta' => -30,
                'feedback' => 'That link could steal credentials or install malware.',
                'explanation' => 'Phishing emails often use look‑alike domains and urgent language to push you into clicking. Always navigate to the official site manually or verify through trusted channels.',
                'sort_order' => 3,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step1->id,
                'next_step_id' => $step2->id,
                'text' => 'REPLY: Ask for more details and provide account info',
                'is_safe' => false,
                'score_delta' => -20,
                'feedback' => 'Replying can confirm your address and leak data.',
                'explanation' => 'Attackers may use replies to gather information or continue the social engineering. Don\'t engage — report and delete.',
                'sort_order' => 4,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step2->id,
                'next_step_id' => $step3->id,
                'text' => 'VERIFY: Call the supplier using a known phone number before opening anything',
                'is_safe' => true,
                'score_delta' => 20,
                'feedback' => 'Great — you verified out-of-band.',
                'explanation' => 'When something is unexpected (especially attachments), verify using a trusted contact method. Don\'t trust phone numbers or links contained in the email itself.',
                'sort_order' => 1,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step2->id,
                'next_step_id' => $step3->id,
                'text' => 'REPORT: Report the message as suspicious to IT/security',
                'is_safe' => true,
                'score_delta' => 15,
                'feedback' => 'Good — reporting is safer than opening.',
                'explanation' => 'Executable attachments can contain malware. Reporting enables investigation and protective actions for other users.',
                'sort_order' => 2,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step2->id,
                'next_step_id' => $step3->id,
                'text' => 'OPEN: Double‑click the attachment to “view the invoice”',
                'is_safe' => false,
                'score_delta' => -40,
                'feedback' => 'That file extension suggests malware.',
                'explanation' => 'A file named "invoice.pdf.exe" is an executable program, not a PDF. Running it can install ransomware or a backdoor.',
                'sort_order' => 3,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step2->id,
                'next_step_id' => $step3->id,
                'text' => 'FORWARD: Send the attachment to a coworker to check it',
                'is_safe' => false,
                'score_delta' => -25,
                'feedback' => 'Forwarding can spread the malware.',
                'explanation' => 'Never forward suspicious attachments. If you need help, contact IT/security and share details safely (e.g., screenshots or headers), not the executable.',
                'sort_order' => 4,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step3->id,
                'next_step_id' => null,
                'text' => 'VERIFY: Open your browser and type the known company URL (or use a bookmark) before updating',
                'is_safe' => true,
                'score_delta' => 20,
                'feedback' => 'Best practice — you used a trusted path.',
                'explanation' => 'Even if an email looks legitimate, using known URLs reduces the risk of being routed to a spoofed site.',
                'sort_order' => 1,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step3->id,
                'next_step_id' => null,
                'text' => 'CALL IT: Confirm the patch notice with the helpdesk before doing anything',
                'is_safe' => true,
                'score_delta' => 15,
                'feedback' => 'Good — verification beats guessing.',
                'explanation' => 'If you\'re unsure, verifying via internal support is a safe step and helps prevent falling for well-crafted phishing.',
                'sort_order' => 2,
            ]);

            SimulationChoice::query()->create([
                'step_id' => $step3->id,
                'next_step_id' => null,
                'text' => 'IGNORE: Do nothing and postpone the update indefinitely',
                'is_safe' => false,
                'score_delta' => -20,
                'feedback' => 'Delaying patches increases risk.',
                'explanation' => 'Security patches often fix actively exploited vulnerabilities. If you\'re uncertain, verify — but don\'t ignore updates long-term.',
                'sort_order' => 3,
            ]);
        }

        // ─────────────────────────────────────────────────────────────
        // Simulation 2: Ransomware Response with Video
        // ─────────────────────────────────────────────────────────────
        $simulation2 = Simulation::firstOrCreate(
            ['title' => 'Ransomware Attack Response Simulation'],
            [
                'category_id' => $category->id,
                'description' => 'Your computer has been infected with ransomware. Follow proper incident response procedures. Video guides show best practices for handling this critical situation.',
                'difficulty' => 'hard',
                'time_limit_seconds' => 1500, // 25 minutes
                'max_score' => 100,
                'is_active' => true,
            ]
        );

        // Add instructional videos for Simulation 2
        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation2->id,
                'title' => 'Ransomware: What You Need to Know',
            ],
            [
                'description' => 'Understand ransomware attacks, how they spread, and their impact on organizations.',
                'video_url' => 'https://www.youtube.com/embed/Vkjekr6jacg',
                'sort_order' => 1,
            ]
        );

        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation2->id,
                'title' => 'Incident Response Protocol',
            ],
            [
                'description' => 'Step-by-step guide for responding to a ransomware incident.',
                'video_url' => 'https://www.youtube.com/embed/pLiesXndBL0',
                'sort_order' => 2,
            ]
        );

        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation2->id,
                'title' => 'Do NOT Pay Ransom - Reporting to Authorities',
            ],
            [
                'description' => 'Why you should not pay ransom and how to report to law enforcement.',
                'video_url' => 'https://www.youtube.com/embed/3cpIuFBQBmo',
                'sort_order' => 3,
            ]
        );

        // Add simulation steps for Simulation 2
        $steps2 = [
            [
                'step_order' => 1,
                'title' => 'Detection: Files Cannot Be Accessed',
                'prompt' => "You notice many files on your computer now have the extension \".locked\" and cannot be opened.\n\nA message has appeared on your screen:\n\n\"YOUR FILES HAVE BEEN ENCRYPTED. Send 2 Bitcoin to unlock. Contact: attacker@darkweb.example\"\n\nAffected: Documents, Photos, Videos, Spreadsheets.\n\nWhat is your first action?",
                'education' => 'NEVER pay the ransom — it funds criminals and does not guarantee file recovery. Immediately disconnect from the network to stop the spread, then report to your IT/security team. Do not try to fix it yourself.',
            ],
            [
                'step_order' => 2,
                'title' => 'Action: Report and Preserve Evidence',
                'prompt' => "You have contacted IT. They confirm this is ransomware.\n\nThey ask you to document what you were doing before the infection occurred.\n\nIT says: \"Please do not shut down the computer yet — we need to collect forensic evidence first.\"\n\nWhat information should you gather to help the investigation?",
                'education' => 'Provide IT with: the exact time you first noticed it, any suspicious emails or links you clicked recently, and any USB devices that were connected. Let IT decide when to power off — they may need to capture volatile memory evidence first.',
            ],
            [
                'step_order' => 3,
                'title' => 'Recovery: Restore from Backup',
                'prompt' => "IT has isolated your computer from the network. They are now restoring your files from yesterday's backup. The process will take approximately 4 hours.\n\nWhile you wait, what should you do?",
                'education' => 'Use this time productively: help colleagues check if they are also infected, review security awareness materials to understand how to prevent this in future, and avoid using any other company device until IT clears it.',
            ],
        ];

        foreach ($steps2 as $stepData) {
            SimulationStep::firstOrCreate(
                [
                    'simulation_id' => $simulation2->id,
                    'step_order' => $stepData['step_order'],
                ],
                $stepData
            );
        }

        // ─────────────────────────────────────────────────────────────
        // Simulation 3: Social Engineering Defense with Video
        // ─────────────────────────────────────────────────────────────
        $simulation3 = Simulation::firstOrCreate(
            ['title' => 'Social Engineering Defense Simulation'],
            [
                'category_id' => $category->id,
                'description' => 'An attacker is trying to manipulate you through phone calls, emails, and in-person interactions. Can you recognize and resist the social engineering attempt? Video training covers common tactics.',
                'difficulty' => 'medium',
                'time_limit_seconds' => 1200, // 20 minutes
                'max_score' => 100,
                'is_active' => true,
            ]
        );

        // Add instructional videos for Simulation 3
        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation3->id,
                'title' => 'Social Engineering Tactics and Red Flags',
            ],
            [
                'description' => 'Learn about common social engineering techniques including pretexting, baiting, and manipulation.',
                'video_url' => 'https://www.youtube.com/embed/lc7scxvKQOo',
                'sort_order' => 1,
            ]
        );

        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation3->id,
                'title' => 'How to Respond to Suspicious Requests',
            ],
            [
                'description' => 'Best practices for handling suspicious phone calls, emails, and in-person requests.',
                'video_url' => 'https://www.youtube.com/embed/2AGR0tZ8bfI',
                'sort_order' => 2,
            ]
        );

        // Add simulation steps for Simulation 3
        $steps3 = [
            [
                'step_order' => 1,
                'title' => 'Phone Call: "IT Support Verification"',
                'prompt' => "Your phone rings from an unknown number.\n\nCaller: \"Hi, this is Mike from IT Support. We're running urgent security updates and need to verify your credentials. Can you confirm your username and the last 4 digits of your Social Security Number?\"\n\nThe caller sounds professional and mentions your company by name.\n\nWhat do you do?",
                'education' => 'IT departments NEVER ask for credentials over the phone. Always hang up and call IT directly using the number from your company\'s official directory — not a number the caller provides. Attackers often know company names to sound convincing.',
            ],
            [
                'step_order' => 2,
                'title' => 'Email: "Account Compromise Alert"',
                'prompt' => "From: security@company.com\nSubject: URGENT: Your account has been compromised\n\nWe detected suspicious activity on your account. Click the link below immediately to secure it:\n\nhttps://company-security-verify.example.com/reset\n\nYou must act within 30 minutes or your account will be locked.",
                'education' => 'Urgent security alerts with time pressure are a classic manipulation tactic. Never click links in these emails. Instead, open your browser and navigate directly to the official company portal using a bookmark or the address you know.',
            ],
            [
                'step_order' => 3,
                'title' => 'In-Person: Tailgating into Secure Area',
                'prompt' => "You are about to enter the server room using your access card.\n\nA person in a company uniform carrying a box labeled \"IT Equipment\" approaches and says: \"Hey, can you hold the door? My hands are full and I forgot my badge in the car.\"\n\nThe person seems friendly and mentions the name of your IT manager.\n\nWhat do you do?",
                'education' => 'This is tailgating — a physical social engineering attack. Do not hold the door, even if the person seems legitimate. Politely direct them to the security desk or reception. Knowing someone\'s name does not prove their identity.',
            ],
        ];

        foreach ($steps3 as $stepData) {
            SimulationStep::firstOrCreate(
                [
                    'simulation_id' => $simulation3->id,
                    'step_order' => $stepData['step_order'],
                ],
                $stepData
            );
        }

        // ─────────────────────────────────────────────────────────────
        // Simulation 4: Secure Password Management with Video
        // ─────────────────────────────────────────────────────────────
        $simulation4 = Simulation::firstOrCreate(
            ['title' => 'Password Security Best Practices'],
            [
                'category_id' => $category->id,
                'description' => 'Learn and practice creating strong passwords and managing them securely. Video tutorials show common mistakes and best practices for password hygiene.',
                'difficulty' => 'easy',
                'time_limit_seconds' => 900, // 15 minutes
                'max_score' => 100,
                'is_active' => true,
            ]
        );

        // Add instructional videos for Simulation 4
        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation4->id,
                'title' => 'Creating Strong Passwords',
            ],
            [
                'description' => 'Learn the characteristics of strong passwords and how to create memorable but secure passwords.',
                'video_url' => 'https://www.youtube.com/embed/aEmXedODqSY',
                'sort_order' => 1,
            ]
        );

        SimulationVideo::firstOrCreate(
            [
                'simulation_id' => $simulation4->id,
                'title' => 'Password Manager Benefits and Setup',
            ],
            [
                'description' => 'How to use password managers securely to store and generate strong passwords.',
                'video_url' => 'https://www.youtube.com/embed/d8bKdvDABdc',
                'sort_order' => 2,
            ]
        );

        // Add simulation steps for Simulation 4
        $steps4 = [
            [
                'step_order' => 1,
                'title' => 'Evaluate Password Strength',
                'prompt' => "You are reviewing the passwords your team members want to use. Rate each one:\n\n1. password\n2. 123456\n3. MyDog2020\n4. K7@mPx#9QlR2wN\n5. Tr0pic@lSunset\$2024!Blue\n\nWhich passwords are acceptable for a work account, and which are too weak?",
                'education' => 'Strong passwords use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. They avoid dictionary words and personal information. Passwords 4 and 5 are strong; 1-3 are dangerously weak and easily cracked.',
            ],
            [
                'step_order' => 2,
                'title' => 'Create Your Own Strong Password',
                'prompt' => "Your IT policy requires all staff to update their passwords. The new requirements are:\n\n• At least 14 characters\n• Mix of uppercase and lowercase letters\n• At least one number and one special character\n• Must NOT contain your name, email, or common words\n• Must NOT reuse any of your last 5 passwords\n\nHow would you approach creating a compliant password?",
                'education' => 'Use a passphrase approach: combine 3-4 random words with numbers and symbols (e.g., "River!Lamp42Star$"). This is both strong and memorable. A password manager can generate and store truly random passwords so you don\'t have to remember them.',
            ],
            [
                'step_order' => 3,
                'title' => 'Password Management Strategy',
                'prompt' => "You manage accounts on 15 different systems. A colleague suggests the following approaches:\n\n1. Use the same strong password everywhere to remember it easily\n2. Write all passwords in a notebook kept in your desk drawer\n3. Use a password manager with a strong master password and 2FA\n4. Use slight variations (password1, password2, password3) for each site\n\nWhich approach should you recommend?",
                'education' => 'Only option 3 is truly safe. Using the same password means one breach compromises all accounts. Written passwords can be found or stolen. Variations are predictable and easily cracked once the pattern is discovered. A password manager is the gold standard.',
            ],
        ];

        foreach ($steps4 as $stepData) {
            SimulationStep::firstOrCreate(
                [
                    'simulation_id' => $simulation4->id,
                    'step_order' => $stepData['step_order'],
                ],
                $stepData
            );
        }

        if (isset($this->command)) {
            $this->command->info('✓ Simulation with Video Seeders completed successfully!');
            $this->command->info('');
            $this->command->info('Created 4 Simulations with Videos:');
            $this->command->info('');
            $this->command->info('1. ' . $simulation1->title . ' (' . $simulation1->difficulty . ') — ' . $simulation1->steps()->count() . ' steps, ' . $simulation1->videos()->count() . ' videos');
            $this->command->info('2. ' . $simulation2->title . ' (' . $simulation2->difficulty . ') — ' . $simulation2->steps()->count() . ' steps, ' . $simulation2->videos()->count() . ' videos');
            $this->command->info('3. ' . $simulation3->title . ' (' . $simulation3->difficulty . ') — ' . $simulation3->steps()->count() . ' steps, ' . $simulation3->videos()->count() . ' videos');
            $this->command->info('4. ' . $simulation4->title . ' (' . $simulation4->difficulty . ') — ' . $simulation4->steps()->count() . ' steps, ' . $simulation4->videos()->count() . ' videos');
        }
    }
}
