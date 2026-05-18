<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationStep;
use App\Models\SimulationVideo;
use Illuminate\Database\Seeder;

class SampleContentWithVideosSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSimulationsWithVideos();
        $this->seedTimedQuizzes();
    }

    private function seedSimulationsWithVideos(): void
    {
        $social   = QuizCategory::where('slug', 'social-engineering')->first();
        $ransomware = QuizCategory::where('slug', 'ransomware')->first();

        // ── Simulation 1: Social Engineering Phone Call ─────────────────────
        if ($social && !Simulation::where('title', 'Social Engineering: IT Support Call')->exists()) {
            $sim = Simulation::create([
                'category_id'        => $social->id,
                'title'              => 'Social Engineering: IT Support Call',
                'description'        => 'A caller claims to be from IT Support and needs your credentials urgently. Make the right decisions.',
                'difficulty'         => 'medium',
                'time_limit_seconds' => 300,
                'max_score'          => 100,
                'is_active'          => true,
            ]);

            // Videos
            SimulationVideo::create([
                'simulation_id' => $sim->id,
                'title'         => 'What is Social Engineering?',
                'description'   => 'A short introduction to social engineering attacks and why they are effective.',
                'video_url'     => 'https://www.youtube.com/watch?v=lc7scxvKQOo',
                'sort_order'    => 1,
            ]);
            SimulationVideo::create([
                'simulation_id' => $sim->id,
                'title'         => 'Recognising Vishing Attacks',
                'description'   => 'How attackers use phone calls to manipulate targets — with real examples.',
                'video_url'     => 'https://www.youtube.com/watch?v=6nwFpBGY1fE',
                'sort_order'    => 2,
            ]);

            // Steps & Choices
            $s1 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 1,
                'title'         => 'Unexpected Call',
                'prompt'        => "You receive a call: \"Hi, this is Mark from the IT Help Desk. We detected unusual login attempts on your account. To prevent a lockout I need to verify your employee ID and current password right now.\"",
                'education'     => 'Legitimate IT staff will never ask for your password over the phone. Always verify caller identity through official channels.',
            ]);

            $s2 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 2,
                'title'         => 'Caller Becomes Insistent',
                'prompt'        => "The caller says: \"I understand your hesitation, but this is urgent — we have only 10 minutes before your account is locked. Just give me your password and I will take care of it for you.\"",
                'education'     => 'High-pressure tactics are a red flag. Urgency is designed to make you skip your normal verification steps.',
            ]);

            $s3 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 3,
                'title'         => 'Next Steps After the Call',
                'prompt'        => 'You ended the suspicious call. What do you do next?',
                'education'     => 'Always report suspected social engineering attempts to your security/IT team so they can alert others and investigate.',
            ]);

            // Step 1 choices
            SimulationChoice::create(['step_id' => $s1->id, 'next_step_id' => null,      'text' => 'Give your employee ID and password to unblock the account', 'is_safe' => false, 'score_delta' => -50, 'feedback' => 'Unsafe! Sharing passwords is never required by real IT staff.', 'explanation' => 'Attackers use impersonation to harvest credentials. Real IT admins reset accounts without needing your password.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $s1->id, 'next_step_id' => $s2->id,   'text' => 'Ask for the caller\'s employee ID and say you\'ll call the help desk back on the official number', 'is_safe' => true, 'score_delta' => 10, 'feedback' => 'Good thinking! Verification before action is the right approach.', 'explanation' => 'Hang up and call the official help desk number from the company directory — never use a number the caller provides.', 'sort_order' => 2]);
            SimulationChoice::create(['step_id' => $s1->id, 'next_step_id' => $s2->id,   'text' => 'Stay on the line and ask more questions', 'is_safe' => false, 'score_delta' => -10, 'feedback' => 'Risky. Staying on the call gives the attacker more time to pressure you.', 'explanation' => 'It is safer to end the call and verify through official channels.', 'sort_order' => 3]);

            // Step 2 choices
            SimulationChoice::create(['step_id' => $s2->id, 'next_step_id' => null,    'text' => 'Give the password since the situation sounds urgent', 'is_safe' => false, 'score_delta' => -40, 'feedback' => 'Unsafe. Urgency is a classic manipulation tactic — never give passwords.', 'explanation' => 'Attackers deliberately create panic to bypass critical thinking. Real IT staff never need your password.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $s2->id, 'next_step_id' => $s3->id, 'text' => 'Hang up and call the official IT help desk number to verify', 'is_safe' => true, 'score_delta' => 25, 'feedback' => 'Excellent. You resisted pressure and verified through a trusted channel.', 'explanation' => 'Always call back using official contact details — never trust numbers or links provided by the caller.', 'sort_order' => 2]);

            // Step 3 choices
            SimulationChoice::create(['step_id' => $s3->id, 'next_step_id' => null, 'text' => 'Report the call to the security/IT team and document the caller\'s details', 'is_safe' => true, 'score_delta' => 20, 'feedback' => 'Perfect. Reporting protects the whole organisation.', 'explanation' => 'Security teams can investigate, alert staff, and block further attempts.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $s3->id, 'next_step_id' => null, 'text' => 'Ignore it and get back to work', 'is_safe' => true, 'score_delta' => 0, 'feedback' => 'You avoided harm, but reporting would have helped others.', 'explanation' => 'Unreported incidents allow attackers to try the same tactic on colleagues.', 'sort_order' => 2]);
            SimulationChoice::create(['step_id' => $s3->id, 'next_step_id' => null, 'text' => 'Tell a few colleagues casually, but don\'t file a report', 'is_safe' => true, 'score_delta' => 5, 'feedback' => 'Better than nothing, but a formal report is more effective.', 'explanation' => 'Formal reporting creates a documented record and triggers an official response.', 'sort_order' => 3]);
        }

        // ── Simulation 2: Ransomware Infection ──────────────────────────────
        if ($ransomware && !Simulation::where('title', 'Ransomware: Infected Attachment')->exists()) {
            $sim = Simulation::create([
                'category_id'        => $ransomware->id,
                'title'              => 'Ransomware: Infected Attachment',
                'description'        => 'You receive an email with an invoice attachment. Navigate this ransomware threat scenario.',
                'difficulty'         => 'hard',
                'time_limit_seconds' => 360,
                'max_score'          => 100,
                'is_active'          => true,
            ]);

            // Videos
            SimulationVideo::create([
                'simulation_id' => $sim->id,
                'title'         => 'How Ransomware Works',
                'description'   => 'Explains the ransomware infection chain from phishing email to encrypted files.',
                'video_url'     => 'https://www.youtube.com/watch?v=nKvfIDQJzME',
                'sort_order'    => 1,
            ]);
            SimulationVideo::create([
                'simulation_id' => $sim->id,
                'title'         => 'Ransomware Response & Recovery',
                'description'   => 'Steps to take immediately when you suspect a ransomware infection.',
                'video_url'     => 'https://www.youtube.com/watch?v=7lsf1LfWpzY',
                'sort_order'    => 2,
            ]);

            // Steps
            $r1 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 1,
                'title'         => 'Suspicious Invoice Email',
                'prompt'        => "Email: \"Invoice_March2025.zip — Please review the attached invoice and approve by EOD.\" The sender domain is slightly off: billing@minsu-accounting.example (not your usual internal address).",
                'education'     => 'Ransomware is often delivered through email attachments. Verify the sender and avoid opening unexpected files.',
            ]);

            $r2 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 2,
                'title'         => 'Screen Goes Dark',
                'prompt'        => "You opened the attachment. A window appears: \"YOUR FILES HAVE BEEN ENCRYPTED. Pay 0.5 BTC within 48 hours to recover them.\" Some files on your desktop are now unreadable.",
                'education'     => 'Immediate containment is critical. Disconnect from the network to prevent spread and alert IT immediately — do NOT pay the ransom.',
            ]);

            $r3 = SimulationStep::create([
                'simulation_id' => $sim->id,
                'step_order'    => 3,
                'title'         => 'Containment Decision',
                'prompt'        => 'Your computer is infected. What is your immediate next action?',
                'education'     => 'Quick isolation limits damage. Disconnect the device, preserve evidence, and follow your organisation\'s incident response plan.',
            ]);

            // Step 1 choices
            SimulationChoice::create(['step_id' => $r1->id, 'next_step_id' => $r2->id,  'text' => 'Open the ZIP and double-click the invoice file to review it', 'is_safe' => false, 'score_delta' => -30, 'feedback' => 'Dangerous. Opening the file triggers the ransomware.', 'explanation' => 'Never open unexpected attachments without verifying the sender through official channels.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $r1->id, 'next_step_id' => null,      'text' => 'Verify the sender by calling the accounting team directly before opening anything', 'is_safe' => true, 'score_delta' => 30, 'feedback' => 'Excellent. Verification prevented infection.', 'explanation' => 'Always confirm unexpected file requests through a separate, trusted channel before opening attachments.', 'sort_order' => 2]);
            SimulationChoice::create(['step_id' => $r1->id, 'next_step_id' => $r2->id,  'text' => 'Forward to a colleague to check on their computer', 'is_safe' => false, 'score_delta' => -20, 'feedback' => 'This risks infecting another machine too.', 'explanation' => 'Suspicious files should not be forwarded. Report to IT/security for safe analysis.', 'sort_order' => 3]);

            // Step 2 choices
            SimulationChoice::create(['step_id' => $r2->id, 'next_step_id' => $r3->id, 'text' => 'Disconnect from the network (unplug ethernet / disable WiFi) immediately', 'is_safe' => true, 'score_delta' => 20, 'feedback' => 'Correct first step. Isolation limits the spread.', 'explanation' => 'Disconnecting prevents ransomware from spreading to shared drives and other devices.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $r2->id, 'next_step_id' => null,     'text' => 'Pay the ransom quickly to recover files', 'is_safe' => false, 'score_delta' => -40, 'feedback' => 'Never pay! There is no guarantee of file recovery, and it funds criminal activity.', 'explanation' => 'Payment does not guarantee decryption. Isolate, report, and restore from backups.', 'sort_order' => 2]);
            SimulationChoice::create(['step_id' => $r2->id, 'next_step_id' => $r3->id, 'text' => 'Try to delete the ransomware files yourself', 'is_safe' => false, 'score_delta' => -10, 'feedback' => 'Not recommended without professional guidance — you may destroy forensic evidence.', 'explanation' => 'Leave the device as-is for IT forensics. Your job is to isolate and report.', 'sort_order' => 3]);

            // Step 3 choices
            SimulationChoice::create(['step_id' => $r3->id, 'next_step_id' => null, 'text' => 'Immediately alert IT/security and follow the incident response plan', 'is_safe' => true, 'score_delta' => 25, 'feedback' => 'Perfect response. Prompt reporting enables containment and recovery.', 'explanation' => 'IT can isolate the machine, check backups, and prevent further spread across the network.', 'sort_order' => 1]);
            SimulationChoice::create(['step_id' => $r3->id, 'next_step_id' => null, 'text' => 'Shut down and restart the computer to fix it', 'is_safe' => false, 'score_delta' => -10, 'feedback' => 'Restarting does not remove ransomware and may trigger further encryption.', 'explanation' => 'Do not restart — preserve the state and report to IT immediately.', 'sort_order' => 2]);
        }
    }

    private function seedTimedQuizzes(): void
    {
        $identity  = QuizCategory::where('slug', 'identity-theft')->first();
        $scams     = QuizCategory::where('slug', 'online-scams')->first();
        $malware   = QuizCategory::where('slug', 'malware')->first();

        // ── Quiz 1: Identity Theft (60-second speed quiz) ───────────────────
        if ($identity && !Quiz::where('title', 'Identity Theft: 60-Second Challenge')->exists()) {
            $quiz = Quiz::create([
                'category_id'         => $identity->id,
                'title'               => 'Identity Theft: 60-Second Challenge',
                'description'         => 'A fast-paced quiz on identity theft. Answer all questions before the timer runs out!',
                'difficulty'          => 'medium',
                'kind'                => 'regular',
                'randomize_questions' => true,
                'question_count'      => 5,
                'time_limit_seconds'  => 60,
                'is_active'           => true,
            ]);

            $this->addQuestion($quiz->id, 'multiple_choice', 'What is the most common way identity thieves steal personal information?', 'Identity thieves use multiple methods — phishing, data breaches, and social media mining are the most common digital approaches.', 1, [
                ['A', 'Breaking into your home to steal documents', false],
                ['B', 'Phishing emails and data breaches', true],
                ['C', 'Reading your text messages only', false],
            ]);
            $this->addQuestion($quiz->id, 'true_false', 'True or False: Sharing your date of birth and hometown on social media can help identity thieves.', 'Personal details like birthdate and hometown are frequently used to answer security questions and verify identities.', 2, [
                ['True', 'True', true],
                ['False', 'False', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'Which action best protects your identity online?', 'Using unique, strong passwords and enabling MFA drastically reduces the risk of account takeover, which is a key component of identity theft.', 3, [
                ['A', 'Using the same password everywhere for convenience', false],
                ['B', 'Using a unique strong password + MFA for each account', true],
                ['C', 'Sharing your password only with family', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'You receive a message: "Your identity has been flagged. Verify now at gov-id-verify.example." What do you do?', 'Official government communications use official domains. Always verify through the official agency website.', 4, [
                ['A', 'Click the link and verify immediately', false],
                ['B', 'Ignore it — it is obviously fake', false],
                ['C', 'Go to the official government website directly to check for any notifications', true],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'Which of these is a sign that your identity may have been stolen?', 'Unexpected accounts or charges are classic early warning signs of identity theft. Monitor your credit and accounts regularly.', 5, [
                ['A', 'Receiving a new credit card you did not apply for', true],
                ['B', 'Getting an email about a sale at your favourite store', false],
                ['C', 'A slow internet connection', false],
            ]);
        }

        // ── Quiz 2: Online Scams (90-second quiz) ───────────────────────────
        if ($scams && !Quiz::where('title', 'Online Scams Awareness Quiz')->exists()) {
            $quiz = Quiz::create([
                'category_id'         => $scams->id,
                'title'               => 'Online Scams Awareness Quiz',
                'description'         => 'Test your ability to spot common online scams. You have 90 seconds — think fast!',
                'difficulty'          => 'easy',
                'kind'                => 'regular',
                'randomize_questions' => true,
                'question_count'      => 5,
                'time_limit_seconds'  => 90,
                'is_active'           => true,
            ]);

            $this->addQuestion($quiz->id, 'multiple_choice', 'An online post offers you a brand-new phone for ₱500. What is most likely true?', 'If a deal seems too good to be true, it almost always is. Scammers use unrealistic prices to lure victims.', 1, [
                ['A', 'It is a genuine flash sale from a trusted shop', false],
                ['B', 'It is likely a scam — prices that are too good to be true usually are', true],
                ['C', 'The seller must have surplus stock to sell cheaply', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'A romantic contact online quickly asks you to send money for an emergency. This is most likely a:', 'Romance scams are a major type of online scam. Attackers build trust over time then invent emergencies to extract money.', 2, [
                ['A', 'Real emergency deserving your help', false],
                ['B', 'Romance scam / advance-fee fraud', true],
                ['C', 'Legitimate fundraising request', false],
            ]);
            $this->addQuestion($quiz->id, 'true_false', 'True or False: Legitimate lottery organisations require you to pay a fee before releasing your prize.', 'Real lotteries never require upfront fees. Any "prize" requiring payment first is a scam.', 3, [
                ['True', 'True', false],
                ['False', 'False', true],
            ]);
            $this->addQuestion($quiz->id, 'scenario', 'You sold an item online. The buyer sends a screenshot of a GCash payment but the money has not appeared in your account. They ask you to ship first.', 'Fake payment screenshots are a common scam. Always verify funds have arrived in your actual account before shipping.', 4, [
                ['A', 'Ship immediately — the screenshot is proof of payment', false],
                ['B', 'Wait until the money actually appears in your account before shipping', true],
                ['C', 'Ask the buyer to call you to confirm', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'Which is the safest way to buy items from an unknown online seller?', 'Using platform escrow/COD and secure payment methods protects you if the seller is fraudulent.', 5, [
                ['A', 'Send money via personal GCash/bank transfer immediately', false],
                ['B', 'Use the platform\'s built-in payment system or cash-on-delivery', true],
                ['C', 'Meet in a secluded place to do the transaction', false],
            ]);
        }

        // ── Quiz 3: Malware — Timed (120 seconds) ──────────────────────────
        if ($malware && !Quiz::where('title', 'Malware Defence Quiz')->exists()) {
            $quiz = Quiz::create([
                'category_id'         => $malware->id,
                'title'               => 'Malware Defence Quiz',
                'description'         => 'How well do you know malware? Answer in 2 minutes!',
                'difficulty'          => 'medium',
                'kind'                => 'regular',
                'randomize_questions' => true,
                'question_count'      => 5,
                'time_limit_seconds'  => 120,
                'is_active'           => true,
            ]);

            $this->addQuestion($quiz->id, 'multiple_choice', 'Which behaviour is most likely to result in a malware infection?', 'Downloading pirated software is one of the highest-risk behaviours for malware exposure.', 1, [
                ['A', 'Keeping software updated', false],
                ['B', 'Downloading pirated software from unofficial sites', true],
                ['C', 'Using a password manager', false],
            ]);
            $this->addQuestion($quiz->id, 'true_false', 'True or False: Antivirus software alone is sufficient protection against all modern malware.', 'Antivirus is one layer of defence but not sufficient alone. You also need updates, safe browsing habits, and MFA.', 2, [
                ['True', 'True', false],
                ['False', 'False', true],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'A pop-up says: "VIRUS DETECTED! Call 1-800-FIX-NOW immediately." What is this?', 'Tech support scam pop-ups are a form of scareware — a type of malware designed to frighten users into calling fake support.', 3, [
                ['A', 'A genuine Microsoft warning', false],
                ['B', 'A scareware / tech support scam', true],
                ['C', 'Your antivirus reporting a real threat', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'What does a keylogger do?', 'Keyloggers silently record everything you type, including passwords and credit card numbers.', 4, [
                ['A', 'Speeds up your keyboard input', false],
                ['B', 'Records everything you type and sends it to attackers', true],
                ['C', 'Blocks spam emails', false],
            ]);
            $this->addQuestion($quiz->id, 'multiple_choice', 'Which of the following best reduces the risk of malware spreading on a network?', 'Network segmentation limits the blast radius of a malware infection, preventing it from spreading to all systems.', 5, [
                ['A', 'Using the same password on all devices', false],
                ['B', 'Disabling all firewalls for performance', false],
                ['C', 'Segmenting the network and isolating infected devices immediately', true],
            ]);
        }
    }

    private function addQuestion(int $quizId, string $type, string $prompt, string $explanation, int $sortOrder, array $options): void
    {
        $q = QuizQuestion::create([
            'quiz_id'     => $quizId,
            'type'        => $type,
            'prompt'      => $prompt,
            'explanation' => $explanation,
            'points'      => 1,
            'sort_order'  => $sortOrder,
        ]);

        foreach ($options as $i => [$label, $text, $correct]) {
            QuizOption::create([
                'question_id' => $q->id,
                'label'       => $label,
                'text'        => $text,
                'is_correct'  => $correct,
                'sort_order'  => $i + 1,
            ]);
        }
    }
}
