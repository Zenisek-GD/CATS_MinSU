# 📋 Seeder Setup Guide - Pre-Test & Video Simulations

## Overview

Two new seeders have been created to enhance the CATS system with pre-test assessments and interactive simulations featuring video tutorials:

1. **PreTestSeeder** - Baseline assessment quizzes
2. **SimulationWithVideoSeeder** - Interactive simulations with YouTube video URLs

---

## Part 1: PreTestSeeder

### What It Creates

#### Pre-Test Quiz 1: Cybersecurity Awareness Basics
- **Type**: Fundamental knowledge assessment
- **Difficulty**: Easy
- **Questions**: 10
- **Time Limit**: 15 minutes
- **Topics**:
  * What is phishing
  * Strong password creation
  * Email security
  * Malware basics
  * Social engineering
  * Password reuse risks
  * Ransomware
  * Safe browsing
  * VPN usage
  * Incident response

#### Pre-Test Quiz 2: Advanced Threat Recognition
- **Type**: Advanced knowledge assessment
- **Difficulty**: Medium
- **Questions**: 8
- **Time Limit**: 12 minutes
- **Topics**:
  * Zero-day vulnerabilities
  * Man-in-the-middle attacks
  * Social engineering techniques
  * Two-factor authentication
  * Botnets
  * Spear phishing
  * Credential stuffing
  * Incident response procedures

### How to Run PreTestSeeder

#### Step 1: Run the Seeder

```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan db:seed --class=PreTestSeeder
```

#### Step 2: Verify Success

You'll see output like:
```
✓ Pre-Test Seeders completed successfully!
Pre-Test Quiz 1: Pre-Test: Cybersecurity Awareness Basics
  - 10 questions
  - Difficulty: easy
  - Time limit: 15 minutes

Pre-Test Quiz 2: Pre-Test: Advanced Threat Recognition
  - 8 questions
  - Difficulty: medium
  - Time limit: 12 minutes
```

### Using Pre-Tests in Your Workflow

#### As a Teacher:
1. Assign Pre-Test Quiz 1 to students BEFORE formal training begins
2. Review results to identify knowledge gaps
3. Focus training on weak areas
4. Assign Pre-Test Quiz 2 for more advanced students

#### As an Admin:
1. View pre-test results in analytics
2. Use data to customize training programs
3. Track improvement by comparing pre-test scores with post-training scores
4. Measure training effectiveness using before/after data

#### As a Student:
1. Take pre-test to establish baseline knowledge
2. Don't worry about score - it's for assessment only
3. Note areas where you scored lower
4. Focus on those topics during training

### Example Usage

**Scenario: Company-wide Cybersecurity Training**

```
Timeline:
├─ Day 1: Students take Pre-Test Quiz 1
├─ Days 2-14: Training modules, quizzes, simulations
├─ Day 15: Re-assessment quiz (same content as pre-test)
└─ Admin Review: Compare scores to measure improvement
```

---

## Part 2: SimulationWithVideoSeeder

### What It Creates

#### Simulation 1: Phishing Email Detection Simulation
- **Difficulty**: Easy
- **Time Limit**: 20 minutes
- **Max Score**: 100
- **Steps**: 3 realistic email scenarios
- **Videos Included**:
  1. "How to Identify Phishing Emails" (YouTube embed)
  2. "Email Header Analysis" (YouTube embed)

**Scenarios:**
- Email claiming to be from PayPal (with domain spoofing)
- Email from supplier with suspicious attachment (.pdf.exe)
- Legitimate email from IT department (training to recognize good emails)

---

#### Simulation 2: Ransomware Attack Response Simulation
- **Difficulty**: Hard
- **Time Limit**: 25 minutes
- **Max Score**: 100
- **Steps**: 3 critical decision points
- **Videos Included**:
  1. "Ransomware: What You Need to Know"
  2. "Incident Response Protocol"
  3. "DO NOT Pay Ransom - Reporting to Authorities"

**Scenarios:**
- Detection: Files encrypted and ransom demand appears
- Action: Report incident and preserve evidence
- Recovery: Restore from backup and investigate

---

#### Simulation 3: Social Engineering Defense Simulation
- **Difficulty**: Medium
- **Time Limit**: 20 minutes
- **Max Score**: 100
- **Steps**: 3 social engineering attempts
- **Videos Included**:
  1. "Social Engineering Tactics and Red Flags"
  2. "How to Respond to Suspicious Requests"

**Scenarios:**
- Phone call from fake IT support requesting credentials
- Email claiming account was compromised with urgent action link
- In-person attempt to gain access to secure server room

---

#### Simulation 4: Password Security Best Practices
- **Difficulty**: Easy
- **Time Limit**: 15 minutes
- **Max Score**: 100
- **Steps**: 3 learning activities
- **Videos Included**:
  1. "Creating Strong Passwords"
  2. "Password Manager Benefits and Setup"

**Scenarios:**
- Rate password strength of sample passwords
- Create your own strong password
- Choose best password management strategy

---

### How to Run SimulationWithVideoSeeder

#### Step 1: Run the Seeder

```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan db:seed --class=SimulationWithVideoSeeder
```

#### Step 2: Verify Success

You'll see output like:
```
✓ Simulation with Video Seeders completed successfully!

Created 4 Simulations with Videos:

1. Phishing Email Detection Simulation
   Difficulty: easy
   Steps: 3
   Videos: 2

2. Ransomware Attack Response Simulation
   Difficulty: hard
   Steps: 3
   Videos: 3

3. Social Engineering Defense Simulation
   Difficulty: medium
   Steps: 3
   Videos: 2

4. Password Security Best Practices
   Difficulty: easy
   Steps: 3
   Videos: 2
```

### Understanding Video URLs

Each simulation includes YouTube embedded URLs. These are real educational resources:

**Example Video URL:**
```
https://www.youtube.com/embed/SJBSiu8GYVY
```

**Formats Supported:**
- Full YouTube URLs: `https://www.youtube.com/watch?v=VIDEO_ID`
- Embed URLs: `https://www.youtube.com/embed/VIDEO_ID`
- Custom video URLs from your server: `/storage/videos/training.mp4`

**To Add Your Own Videos:**

Update the seeder or create a migration script:
```php
SimulationVideo::create([
    'simulation_id' => $simulation->id,
    'title' => 'Your Video Title',
    'description' => 'Video description',
    'video_url' => 'https://your-video-platform.com/embed/VIDEO_ID',
    'sort_order' => 1,
]);
```

---

## Part 3: Running Both Seeders Together

### Option 1: Run Individually

```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend

# Run pre-tests
php artisan db:seed --class=PreTestSeeder

# Run simulations with videos
php artisan db:seed --class=SimulationWithVideoSeeder
```

### Option 2: Run Together

```powershell
php artisan db:seed --class=PreTestSeeder --class=SimulationWithVideoSeeder
```

### Option 3: Add to DatabaseSeeder (Recommended)

Edit `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Existing seeders
            ClassroomSeeder::class,
            
            // New seeders
            PreTestSeeder::class,
            SimulationWithVideoSeeder::class,
        ]);
    }
}
```

Then run:
```powershell
php artisan db:seed
```

---

## Part 4: Viewing Your Data

### Access Pre-Tests in API

```bash
# Get all pre-test quizzes
curl -X GET http://localhost:9000/api/quizzes?kind=pretest \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific pre-test quiz
curl -X GET http://localhost:9000/api/quizzes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Access Simulations in API

```bash
# Get all simulations
curl -X GET http://localhost:9000/api/simulations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get simulation with videos
curl -X GET http://localhost:9000/api/simulations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### In the Frontend UI

1. **Login as Teacher**
   - Email: `teacher@example.com`
   - Password: `password`

2. **Create Classroom or Use Existing**

3. **Assign Resources**
   - Go to Classroom → Quizzes → Assign Quiz
   - Select "Pre-Test: Cybersecurity Awareness Basics"
   - Set due date and click Assign

4. **Assign Simulations**
   - Go to Classroom → Simulations → Assign Simulation
   - Select any simulation (e.g., "Phishing Email Detection Simulation")
   - Set due date and click Assign

5. **As Student**
   - Login as student
   - See pre-test and simulations in your classroom
   - Videos appear during simulation playback

---

## Part 5: Customizing the Seeders

### Add More Questions to PreTestSeeder

Edit `database/seeders/PreTestSeeder.php` and add to `$questions1` array:

```php
[
    'text' => 'Your question here?',
    'type' => 'multiple_choice',
    'sort_order' => 11,
    'options' => [
        ['text' => 'Answer A', 'is_correct' => false, 'sort_order' => 1],
        ['text' => 'Correct Answer', 'is_correct' => true, 'sort_order' => 2],
        ['text' => 'Answer C', 'is_correct' => false, 'sort_order' => 3],
        ['text' => 'Answer D', 'is_correct' => false, 'sort_order' => 4],
    ],
],
```

### Add More Simulations

Add new simulation in `SimulationWithVideoSeeder.php`:

```php
$simulation5 = Simulation::firstOrCreate(
    ['title' => 'Your New Simulation'],
    [
        'category_id' => $category->id,
        'description' => 'Description here',
        'difficulty' => 'medium',
        'time_limit_seconds' => 1200,
        'max_score' => 100,
        'is_active' => true,
    ]
);

// Add videos
SimulationVideo::firstOrCreate([
    'simulation_id' => $simulation5->id,
    'title' => 'Video Title',
    'description' => 'Description',
    'video_url' => 'https://youtube.com/embed/VIDEO_ID',
    'sort_order' => 1,
]);

// Add steps
SimulationStep::firstOrCreate([
    'simulation_id' => $simulation5->id,
    'step_order' => 1,
    'title' => 'Step Title',
    'description' => 'Step description',
    'scenario' => json_encode([...]),
]);
```

---

## Part 6: Troubleshooting

### Problem: "SQLSTATE[HY000]: General error: 1030 Got error..."

**Solution:** Database quota exceeded
```powershell
php artisan migrate:refresh
php artisan db:seed
```

### Problem: "Class not found" error

**Solution:** Clear composer autoload
```powershell
composer dump-autoload
php artisan db:seed --class=PreTestSeeder
```

### Problem: Videos not loading in frontend

**Solution:** Check video URL format
```php
// Correct formats:
'https://www.youtube.com/embed/VIDEO_ID'
'https://youtube.com/embed/VIDEO_ID'
'storage/videos/training.mp4'
```

### Problem: Questions not appearing in quiz

**Solution:** Verify question sort_order is correct
```php
// Make sure sort_order is unique and sequential
'sort_order' => 1,
'sort_order' => 2,
'sort_order' => 3,
```

---

## Part 7: Complete Setup Commands

### Fresh Database with All Data

```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend

# 1. Reset database
php artisan migrate:refresh

# 2. Seed with all data (including new seeders)
php artisan db:seed

# 3. Start backend
php artisan serve --port=9000
```

### In Another Terminal

```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend

# 1. Install dependencies
npm install

# 2. Start frontend
npm run dev
```

### Access Application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:9000`
- Test Accounts:
  - Teacher: `teacher@example.com` / `password`
  - Student: `student1@example.com` / `password`

---

## Part 8: Quiz Questions Types

The PreTestSeeder includes multiple question types:

### Multiple Choice
```
Question: "What is phishing?"
Options:
  ☐ A method of catching fish online
  ☒ Fraudulent attempts to obtain sensitive information
  ☐ A software application
  ☐ A type of virus
```

### True/False
```
Question: "Malware is software designed to harm your computer."
Options:
  ☒ True
  ☐ False
```

### Matching (Can be extended)
```
Pair items with their definitions
```

---

## Part 9: Simulation Steps Structure

Each simulation step contains:

```json
{
  "step_order": 1,
  "title": "Step Title",
  "description": "What the user sees",
  "scenario": {
    "situation": "Detailed scenario",
    "question": "What would you do?",
    "options": [
      {
        "action": "Choice A",
        "correct": true/false,
        "feedback": "Why this is right/wrong"
      }
    ]
  }
}
```

---

## Summary

| Seeder | Pre-Tests | Simulations | Videos | Questions |
|--------|-----------|-------------|--------|-----------|
| PreTestSeeder | 2 | 0 | 0 | 18 total |
| SimulationWithVideoSeeder | 0 | 4 | 9 | 0 |
| **Total** | **2** | **4** | **9** | **18** |

---

## Next Steps

1. ✅ Run both seeders
2. ✅ Create a test classroom as teacher
3. ✅ Assign pre-test to students
4. ✅ Assign simulations with videos
5. ✅ Have students take pre-test and simulations
6. ✅ Review results in analytics
7. ✅ Compare pre-test and post-training scores for effectiveness

---

*Last Updated: May 11, 2026*
*Seeders Version: 1.0*
