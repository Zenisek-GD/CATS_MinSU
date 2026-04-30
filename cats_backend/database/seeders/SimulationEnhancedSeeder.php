<?php

namespace Database\Seeders;

use App\Models\QuizCategory;
use App\Models\Simulation;
use App\Models\SimulationChoice;
use App\Models\SimulationStep;
use Illuminate\Database\Seeder;

class SimulationEnhancedSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedGCashScam();
        $this->seedFacebookTakeover();
        $this->seedJobPhishing();
    }

    private function seedGCashScam(): void
    {
        $cat = QuizCategory::query()->where('slug', 'online-scams')->first();
        if (!$cat) return;

        $sim = Simulation::query()->firstOrCreate(
            ['category_id' => $cat->id, 'title' => 'GCash Text Scam'],
            [
                'description' => 'You receive an SMS about a suspicious GCash transfer. Practice identifying scam messages and protecting your mobile wallet.',
                'difficulty' => 'medium',
                'time_limit_seconds' => 300,
                'max_score' => 100,
                'is_active' => true,
            ]
        );
        if ($sim->steps()->count() > 0) return;

        $s1 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>1,'title'=>'Suspicious SMS Received','prompt'=>"You receive a text message:\n\n\"GCash: You have received PHP 5,000.00 from Juan D. Your balance is now PHP 7,350.00. If you did not authorize this transaction, click here to reverse: https://gcash-secure-ph.example.com/reverse?ref=TX8834\"\n\nYou did NOT expect any transfer. What do you do?",'education'=>'Scammers send fake \"received money\" messages to trick you into clicking phishing links. Real GCash notifications come from the official app, not random SMS links.']);
        $s2 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>2,'title'=>'The Scammer Calls You','prompt'=>"Your phone rings. The caller says:\n\n\"Good day po! I\'m from GCash Support. We noticed an accidental transfer to your account. We need you to send it back immediately through this GCash number: 0917-XXX-XXXX. If you don\'t return it within 30 minutes, we will file a legal complaint.\"\n\nHow do you respond?",'education'=>'Real GCash support will never call you to demand money transfers. Scammers use urgency and legal threats to pressure victims.']);
        $s3 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>3,'title'=>'Protecting Yourself','prompt'=>"You've identified this as a scam. What's the best next step?",'education'=>'Report scam numbers to GCash via the app, block the sender, and warn friends/family.']);

        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Click Link: Tap the link to check if the money is really there','is_safe'=>false,'score_delta'=>-30,'feedback'=>'Dangerous! The link leads to a phishing site that can steal your GCash credentials.','explanation'=>'Never click links from unexpected SMS messages.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>'Verify in App: Open the official GCash app to check your actual balance','is_safe'=>true,'score_delta'=>25,'feedback'=>'Smart move! Checking directly in the official app is the safest way to verify.','explanation'=>'Always verify transactions through the official GCash app.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Reply to SMS: Text back asking who sent the money','is_safe'=>false,'score_delta'=>-15,'feedback'=>'Risky. Replying confirms your number is active.','explanation'=>'Replying to scam messages tells the sender your number is active.','sort_order'=>3]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>"Delete & Ignore: Delete the message and don't interact with it",'is_safe'=>true,'score_delta'=>15,'feedback'=>'Safe choice, though reporting it would help protect others too.','explanation'=>'Ignoring scam messages is safe, but reporting them helps block scammers.','sort_order'=>4]);

        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Send Money: Transfer the amount they mentioned to avoid legal trouble','is_safe'=>false,'score_delta'=>-40,'feedback'=>'This is exactly what the scammer wants!','explanation'=>'Scammers fabricate fake transfers to trick you into sending real money.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Hang Up: End the call immediately and block the number','is_safe'=>true,'score_delta'=>20,'feedback'=>'Correct! Hanging up on scammers is always the right move.','explanation'=>'You are never obligated to stay on a suspicious call.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Share Info: Give them your MPIN so they can "reverse" the transaction','is_safe'=>false,'score_delta'=>-40,'feedback'=>'Never share your MPIN!','explanation'=>'Your MPIN is like your ATM PIN. GCash will NEVER ask for it over the phone.','sort_order'=>3]);

        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Report & Block: Report the number to GCash and block the sender','is_safe'=>true,'score_delta'=>25,'feedback'=>'Excellent! Reporting helps GCash block scammers.','explanation'=>'Use the GCash app Report a Concern feature or call hotline 2882.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Warn Others: Post about the scam on social media to alert friends','is_safe'=>true,'score_delta'=>15,'feedback'=>'Good thinking! Warning others helps prevent more victims.','explanation'=>'Sharing scam awareness is helpful, but also formally report it.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Do Nothing: Just forget about it and move on','is_safe'=>true,'score_delta'=>5,'feedback'=>'You are safe, but reporting would help protect others.','explanation'=>'The scammer will continue targeting others. Reporting is a community responsibility.','sort_order'=>3]);
    }

    private function seedFacebookTakeover(): void
    {
        $cat = QuizCategory::query()->where('slug', 'social-engineering')->first();
        if (!$cat) return;

        $sim = Simulation::query()->firstOrCreate(
            ['category_id' => $cat->id, 'title' => 'Facebook Account Takeover'],
            ['description'=>'You receive a suspicious Facebook security alert. Practice spotting social engineering tactics.','difficulty'=>'medium','time_limit_seconds'=>300,'max_score'=>100,'is_active'=>true]
        );
        if ($sim->steps()->count() > 0) return;

        $s1 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>1,'title'=>'Security Alert Message','prompt'=>"You receive a Facebook Messenger message from a friend:\n\n\"OMG! Is this you in the video? Someone posted this and tagged you! Click here to see: https://fb-video-check.example.com/watch?v=your-name\"\n\nYour friend's profile picture and name look normal. What do you do?",'education'=>'Account takeover scams spread through compromised friend accounts. Verify with your friend through another channel.']);
        $s2 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>2,'title'=>'Fake Login Page','prompt'=>"The link opens a page that looks exactly like the Facebook login screen.\n\nURL: https://fb-video-check.example.com/login\n\nIt says: \"Your session has expired. Please log in again to view this content.\"\n\nThe page asks for your email/phone and password. What do you do?",'education'=>'Phishing pages can perfectly replicate the look of Facebook. Always check the URL.']);
        $s3 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>3,'title'=>'Securing Your Account','prompt'=>"Whether or not you entered credentials, what should you do now to protect yourself?",'education'=>'Change your password, enable 2FA, review active sessions, and warn your friends.']);

        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Click Link: Open the link to see what video was posted about you','is_safe'=>false,'score_delta'=>-25,'feedback'=>'Risky! This link likely leads to a phishing site.','explanation'=>'Even if the message seems to come from a friend, their account may be hacked.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>'Verify First: Message or call your friend through a different channel','is_safe'=>true,'score_delta'=>25,'feedback'=>'Smart! Verifying through another channel is the safest approach.','explanation'=>'A quick text or call can confirm whether your friend actually sent the message.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>"Report Message: Mark the message as suspicious and don't click anything",'is_safe'=>true,'score_delta'=>20,'feedback'=>'Good call! Reporting helps Facebook detect compromised accounts.','explanation'=>'Use Messenger Report feature to flag suspicious messages.','sort_order'=>3]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Forward Link: Share the link with other friends to ask if they know about it','is_safe'=>false,'score_delta'=>-20,'feedback'=>'No! Forwarding spreads the scam to more potential victims.','explanation'=>'Sharing suspicious links spreads the attack to more people.','sort_order'=>4]);

        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Enter Credentials: Type your email and password to log in','is_safe'=>false,'score_delta'=>-40,'feedback'=>'Your credentials are now in the hands of the attacker!','explanation'=>'The URL is NOT facebook.com. Entering your credentials here gives the attacker full access.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Close Page: Close the browser tab immediately — the URL is not facebook.com','is_safe'=>true,'score_delta'=>25,'feedback'=>'Correct! You noticed the fake URL and avoided the trap.','explanation'=>'Always check the URL before entering any credentials.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Use Fake Info: Enter a fake email and password to test if the site is real','is_safe'=>false,'score_delta'=>-10,'feedback'=>'Interacting with phishing sites can still be risky.','explanation'=>'Some phishing sites install malware or track your device just by visiting.','sort_order'=>3]);

        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Secure Account: Change your password and enable two-factor authentication','is_safe'=>true,'score_delta'=>25,'feedback'=>'Excellent! Securing your account immediately is the top priority.','explanation'=>'Go to Facebook Settings > Security and Login. Change password, enable 2FA.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Warn Friend: Let your friend know their account may be hacked','is_safe'=>true,'score_delta'=>20,'feedback'=>'Great thinking! Your friend needs to know too.','explanation'=>'Contact your friend through phone/text (not Messenger).','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>"Ignore It: Just forget about it since you didn't enter your real password",'is_safe'=>false,'score_delta'=>-10,'feedback'=>'Not recommended. Even visiting a phishing site may expose you.','explanation'=>'Change your password if in doubt, and warn your friend about their compromised account.','sort_order'=>3]);
    }

    private function seedJobPhishing(): void
    {
        $cat = QuizCategory::query()->where('slug', 'phishing')->first();
        if (!$cat) return;

        $sim = Simulation::query()->firstOrCreate(
            ['category_id' => $cat->id, 'title' => 'Job Offer Phishing Email'],
            ['description'=>'You receive an exciting job offer that seems too good to be true. Practice identifying phishing in job recruitment scams.','difficulty'=>'medium','time_limit_seconds'=>300,'max_score'=>100,'is_active'=>true]
        );
        if ($sim->steps()->count() > 0) return;

        $s1 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>1,'title'=>'Job Offer Email','prompt'=>"From: HR Department <careers@big-company-hiring.example.com>\nReply-To: hr.recruitment.ph@gmail.com\nTo: you@minsu.example\nSubject: Congratulations! You've Been Selected for a Part-Time Job — PHP 25,000/month\n\nDear Student,\n\nWe are pleased to inform you that you have been pre-selected for a part-time Data Entry position:\n- PHP 25,000/month salary\n- Work from home, flexible hours (2-3 hrs/day)\n- No experience required\n\nPlease fill out the attached form with your personal details and send to hr.recruitment.ph@gmail.com.\n\nRequired: Full name, address, birthday, School ID photo, GCash/bank account number.\n\nPlease respond within 48 hours.\n\nBest regards, Maria Santos, HR Manager",'education'=>'Red flags: unsolicited job offer, too-good-to-be-true salary, Gmail reply-to for a company, requests for personal financial info upfront, urgency pressure.']);
        $s2 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>2,'title'=>'Application Form','prompt'=>"The attachment is a Google Form asking for:\n\n- Full legal name\n- Complete home address\n- Birthday and age\n- School ID number\n- Mother's maiden name\n- GCash number\n- Bank account number\n- Two valid IDs (upload photos)\n\nThe form header says \"CONFIDENTIAL — HR Use Only\". What do you do?",'education'=>'Legitimate employers never ask for bank details, mother maiden name, or ID photos during initial application.']);
        $s3 = SimulationStep::query()->create(['simulation_id'=>$sim->id,'step_order'=>3,'title'=>'Protecting Your Identity','prompt'=>"What's the best way to handle this situation now?",'education'=>'If you shared info with a scammer: monitor your bank/GCash, change passwords, contact your bank, file a report with NBI Cybercrime.']);

        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Open Attachment: Download and fill out the form — great opportunity!','is_safe'=>false,'score_delta'=>-20,'feedback'=>'Risky! Unsolicited job offers with unrealistic pay are classic phishing bait.','explanation'=>'PHP 25,000/month for 2-3 hours with no experience? Too good to be true.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>'Check Red Flags: Notice the Gmail reply-to and research the company first','is_safe'=>true,'score_delta'=>25,'feedback'=>'Excellent instinct! Checking for red flags is the right first step.','explanation'=>'A legitimate company would use their official email domain, not Gmail.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s2->id,'text'=>'Reply to Email: Ask for more details about the job','is_safe'=>false,'score_delta'=>-10,'feedback'=>'Engaging with scammers confirms your email is active.','explanation'=>'Replying shows your email is active and you are interested, inviting more scams.','sort_order'=>3]);
        SimulationChoice::query()->create(['step_id'=>$s1->id,'next_step_id'=>$s3->id,'text'=>'Delete & Report: Mark as spam/phishing and delete the email','is_safe'=>true,'score_delta'=>20,'feedback'=>'Safe choice! Reporting phishing helps protect other students.','explanation'=>'Report phishing emails to your email provider and MinSU IT department.','sort_order'=>4]);

        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Submit Form: Fill out everything — they need it for HR processing','is_safe'=>false,'score_delta'=>-40,'feedback'=>'You just handed identity thieves everything they need!','explanation'=>'No legitimate employer asks for bank numbers and ID photos during initial application.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Close Form: Recognize this is identity theft bait and close it immediately','is_safe'=>true,'score_delta'=>25,'feedback'=>'Correct! You recognized the identity theft attempt.','explanation'=>'A form asking for bank details and mother maiden name upfront is designed to steal your identity.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s2->id,'next_step_id'=>$s3->id,'text'=>'Partial Info: Send only your name and email but not financial details','is_safe'=>false,'score_delta'=>-15,'feedback'=>'Even partial information gives scammers data for targeted attacks.','explanation'=>'Even your name and email can be used for spear phishing — more targeted scam attempts.','sort_order'=>3]);

        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Report to Authorities: Report the scam to MinSU IT and NBI Cybercrime','is_safe'=>true,'score_delta'=>25,'feedback'=>'Excellent! Reporting helps investigate and shut down scam operations.','explanation'=>'File a report with NBI Cybercrime Division. Also notify MinSU IT to warn other students.','sort_order'=>1]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Warn Classmates: Alert your classmates and share the red flags','is_safe'=>true,'score_delta'=>20,'feedback'=>'Great! Peer warnings are very effective in preventing scams.','explanation'=>'Students are prime targets for job scams. Sharing red flags builds collective awareness.','sort_order'=>2]);
        SimulationChoice::query()->create(['step_id'=>$s3->id,'next_step_id'=>null,'text'=>'Ignore It: Just delete the email and move on','is_safe'=>true,'score_delta'=>5,'feedback'=>'You are safe, but reporting would help protect fellow students.','explanation'=>'The scammer will continue targeting others. Reporting helps protect the community.','sort_order'=>3]);
    }
}
