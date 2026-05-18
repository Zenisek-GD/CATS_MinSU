# 📚 CATS System - Complete User Guide (End User to Admin)

## 🎯 System Overview

**CATS_MinSU** (Cyber Awareness Training System - Minimum Sustainability Unit) is a comprehensive cybersecurity awareness training platform that provides:

- **Interactive Training Modules** - Learn cybersecurity concepts
- **Quizzes** - Test knowledge with quiz assessments
- **Simulations** - Practice real-world cyber attack scenarios
- **Classroom Management** - Teachers can organize students into classes
- **Progress Tracking** - Monitor learning outcomes
- **Research Analytics** - Analyze training effectiveness (Admin)

**Target Users:**
- 🎓 **Students** - Learn cyber awareness
- 👨‍🏫 **Teachers** - Manage classrooms and assignments
- 🛡️ **Admins** - Monitor system, analyze data, manage users

---

## 📦 Part 1: System Installation & Setup

### Step 1.1: System Requirements

**On Your Computer, You Need:**
- Windows 10/11, macOS, or Linux
- PHP 8.1+ (for backend)
- Node.js 18+ (for frontend)
- MySQL or similar database
- A browser (Chrome, Firefox, Safari, Edge)

### Step 1.2: Installation

#### Option A: One Computer (Local Only)

```powershell
# Terminal 1 - Start Backend
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
composer install              # Install PHP dependencies
php artisan migrate           # Create database tables
php artisan db:seed --class=ClassroomSeeder  # Load test data
php artisan serve --port=9000 # Start backend

# Terminal 2 - Start Frontend
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm install                   # Install JavaScript dependencies
npm run dev                   # Start frontend development server

# Terminal 3 - Open Browser
# Go to: http://localhost:5173
```

#### Option B: Share with Another Device (Using ngrok)

```powershell
# Step 1: Start backend
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan serve --port=9000

# Step 2: Build frontend
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm run build

# Step 3: Copy to backend
Copy-Item -Path "dist\*" -Destination "..\cats_backend\public\dist\" -Recurse -Force

# Step 4: Start ngrok tunnel (new terminal)
ngrok start --all --config="C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend\ngrok.yml"

# Step 5: Get ngrok URL (see console output like: https://lake-enactment-kitty.ngrok-free.dev)

# Step 6: Update .env files with ngrok URL
# In cats_frontend/.env:
# VITE_API_BASE_URL=https://xxxx.ngrok-free.dev/api
# VITE_BACKEND_URL=https://xxxx.ngrok-free.dev

# In cats_backend/.env:
# APP_URL=https://xxxx.ngrok-free.dev
# FRONTEND_URL=https://xxxx.ngrok-free.dev

# Step 7: Share URL with others
# Send: https://xxxx.ngrok-free.dev
```

### Step 1.3: Test Accounts (After Installation)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Teacher | teacher@example.com | password |
| Student 1 | student1@example.com | password |
| Student 2 | student2@example.com | password |
| Student 3 | student3@example.com | password |

---

## 🎓 Part 2: Student / End User Features

### What Students Can Do

Students learn cybersecurity through interactive training, take quizzes, and participate in simulations.

### Step 2.1: Login to System

1. **Open Browser**
   - Go to: `http://localhost:5173` (local) or your ngrok URL

2. **Click Login Button**
   - Bottom right of homepage or "Sign In" link

3. **Enter Credentials**
   - Email: `student1@example.com`
   - Password: `password`
   - Click "Login"

4. **You See Dashboard**
   - Welcome message
   - Your enrolled classrooms
   - Available quizzes
   - Available simulations

### Step 2.2: Join a Classroom

#### Method A: Scan QR Code

1. **Ask Your Teacher**
   - Request the QR code for the classroom

2. **Your Device**
   - Click "Join Classroom" button
   - Click "Scan QR Code"
   - Allow camera permission
   - Point camera at the QR code
   - System automatically joins you

#### Method B: Enter Classroom Code

1. **Ask Your Teacher**
   - Request the 8-character classroom code (e.g., `ABC12345`)

2. **In Application**
   - Click "Join Classroom" button
   - Click "Enter Code"
   - Type the code: `ABC12345`
   - Click "Join"

#### Method C: Click Join Link

1. **Teacher Sends You Link**
   - E.g., `https://localhost:5173/join/ABC12345`

2. **Click the Link**
   - Automatically joins you to classroom

### Step 2.3: View Your Classrooms

1. **Click "My Classrooms"** in main menu
2. **See All Joined Classes**
   - Class name
   - Teacher name
   - Number of students
   - Join date

3. **Click Classroom Name**
   - See assigned tasks (quizzes, simulations, modules)
   - See due dates
   - Access resources

### Step 2.4: Take a Quiz

1. **Find Quiz**
   - Navigate to classroom
   - Click "Quizzes" tab
   - See list of assigned quizzes

2. **Start Quiz**
   - Click quiz name
   - Click "Start Quiz" button

3. **Answer Questions**
   - Read each question
   - Select your answer (multiple choice, true/false, etc.)
   - Click "Next" to proceed

4. **Submit Quiz**
   - Click "Submit" on last question
   - System scores your quiz immediately

5. **See Results**
   - Your score (e.g., "8/10 - 80%")
   - Correct answers
   - Explanations for each question
   - Time spent

**Quiz Features:**
- Timer (if set by teacher)
- Progress indicator (Question 3 of 10)
- Review before submitting
- Immediate feedback
- Score history

### Step 2.5: Complete a Simulation

1. **Find Simulation**
   - Navigate to classroom
   - Click "Simulations" tab
   - See assigned simulations

2. **Start Simulation**
   - Click simulation name
   - Click "Start Simulation" button

3. **Scenario Starts**
   - See realistic cyber attack scenario
   - Read the situation
   - Instructions on what to do

4. **Make Decisions**
   - Click actions you would take
   - Answer questions about the threat
   - Identify phishing emails / malware / social engineering

5. **Get Feedback**
   - Immediate feedback on your choices
   - Why your action was right or wrong
   - What would happen in real life

6. **Complete Simulation**
   - See final score
   - Review your decisions
   - See learning insights

**Simulation Examples:**
- Phishing Email Detection: Identify fake emails that look real
- Ransomware Response: Decide what to do if ransomware infects your computer
- Social Engineering: Recognize and resist manipulation attempts
- Password Security: Create secure passwords

### Step 2.6: Complete Training Modules

1. **Find Modules**
   - Click "Training Modules" tab
   - See available modules with status

2. **Start Module**
   - Click module name
   - Click "Start Learning" button

3. **Learn Content**
   - Read lessons
   - Watch videos (if available)
   - See interactive examples
   - Click "Next" to proceed

4. **Complete Module**
   - All sections completed
   - System marks as complete
   - You see certificate (if applicable)

**Module Topics:**
- Cybersecurity Basics
- Phishing Awareness
- Password Management
- Safe Internet Usage
- Malware Protection
- Social Engineering Defense

### Step 2.7: View Your Progress

1. **Click "My Progress"** in menu
2. **See Dashboard**
   - Classrooms enrolled: 2
   - Quizzes completed: 5/8
   - Simulations completed: 3/4
   - Modules completed: 2/6
   - Overall score: 82%

3. **Click on Any Item**
   - See detailed breakdown
   - Historical scores
   - Time spent
   - Strengths and weaknesses

### Step 2.8: Give Feedback (Optional)

1. **After Completing Activity**
   - Quiz / Simulation / Module
   - "Feedback" button appears

2. **Click "Provide Feedback"**
   - Rate content (1-5 stars)
   - Answer questions:
     * Was this useful?
     * Was it clear?
     * Would you recommend this?
   - Optional: Write comments

3. **Submit Feedback**
   - Helps teacher and admin improve content

### Step 2.9: Leave a Classroom

1. **Click "My Classrooms"**
2. **Find Classroom**
3. **Click "..." (More Options)**
4. **Click "Leave Classroom"**
5. **Confirm**
   - You're removed from class
   - Classwork is preserved
   - You can rejoin with new code

### Student Features Summary

| Feature | Purpose | Access |
|---------|---------|--------|
| Join Classroom | Enroll in teacher's class | Dashboard |
| Take Quizzes | Test knowledge | Classroom page |
| Run Simulations | Practice scenarios | Classroom page |
| Learn Modules | Study cybersecurity | Classroom page |
| View Progress | Track performance | My Progress |
| Get Feedback | Immediate learning insights | After activity |
| Leave Class | Unenroll from class | My Classrooms |

---

## 👨‍🏫 Part 3: Teacher Features

### What Teachers Can Do

Teachers create classrooms, manage students, assign training resources, and track student progress.

### Step 3.1: Login as Teacher

1. **Go to Application**
   - `http://localhost:5173`

2. **Click Login**
   - Email: `teacher@example.com`
   - Password: `password`

3. **You See Teacher Dashboard**
   - All your classrooms
   - Total students enrolled
   - Statistics
   - Quick actions

### Step 3.2: Create a Classroom

1. **Click "Create Classroom" Button**
   - Or click "+" icon

2. **Enter Classroom Details**
   - **Classroom Name**: e.g., "Cybersecurity 101"
   - **Description**: e.g., "Introduction to cyber threats and defenses"
   - **Optional**: Academic term, period, grade level

3. **Click "Create Classroom"**
   - Classroom created instantly!
   - System auto-generates:
     * Unique 8-character code (e.g., `ABC12345`)
     * QR code image
     * Join URL

4. **See Classroom Created**
   - Classroom appears in your dashboard
   - Shows classroom code
   - Shows QR code

### Step 3.3: Share Classroom with Students

#### Option A: Download & Share QR Code

1. **Click Classroom Name**
2. **Click "QR Code" Button**
3. **Click "Download QR"**
   - Downloads image file
4. **Share the Image**
   - Email to students
   - Print and display in class
   - Send via learning management system (LMS)
   - Post on class website
5. **Students Scan**
   - Use app to scan QR
   - Automatically joins

#### Option B: Share the Code

1. **Click Classroom Name**
2. **Click "Copy Code"**
3. **Share Code**: `ABC12345`
   - Email, SMS, announcement, whiteboard
4. **Students Enter Code**
   - In app: "Join Classroom" → "Enter Code"
   - Type the code
   - Clicks "Join"

#### Option C: Share Join Link

1. **Click Classroom Name**
2. **Click "Copy Join URL"**
   - URL like: `https://site.com/join/ABC12345`
3. **Share Link**
   - Email to students
   - Post on LMS
   - Add to syllabus
4. **Students Click Link**
   - Automatically joins classroom

### Step 3.4: Manage Students in Classroom

1. **Click Classroom Name**
2. **Click "Students" Tab**

#### View All Students

- See list of enrolled students
- See join date
- See student status
- See progress (if started assignments)

#### Remove a Student

1. **Find student in list**
2. **Click "..." (More Options)**
3. **Click "Remove Student"**
4. **Confirm**
   - Student no longer in class
   - Their work is archived (not deleted)

#### Message Students

1. **Select students (checkbox)**
2. **Click "Send Message"**
3. **Type message**: "Don't forget the quiz is due Friday!"
4. **Click "Send"**
   - Notification sent to students

### Step 3.5: Assign a Quiz to Class

1. **Click Classroom Name**
2. **Click "Quizzes" Tab**

#### Assign New Quiz

1. **Click "Assign Quiz" Button**
2. **Select Quiz**
   - See list of available quizzes:
     * "Phishing Awareness Quiz"
     * "Password Security Quiz"
     * "Social Engineering Quiz"
     * "Malware Detection Quiz"
   - Choose one (or create new)

3. **Set Quiz Options**
   - **Due Date**: e.g., May 15, 2026, 11:59 PM (optional)
   - **Attempts Allowed**: 1, 2, or unlimited
   - **Show Answers**: After submission (recommended) or after due date
   - **Time Limit**: 15 minutes (or leave blank for no limit)

4. **Click "Assign"**
   - Quiz added to classroom
   - All students see it immediately
   - Get notification

#### View Quiz Results

1. **Click Quiz Name**
2. **See Results**
   - Class average: 78%
   - Student list:
     * Name | Score | Time | Status
     * John | 90% | 12 min | Completed
     * Sarah | 85% | 15 min | Completed
   - Download results as CSV

#### Modify Assignment

1. **Click Quiz**
2. **Click "Edit"**
   - Change due date
   - Change time limit
   - Change visibility of answers
3. **Click "Save"**

#### Remove Quiz

1. **Click Quiz**
2. **Click "Remove Assignment"**
3. **Confirm**
   - Quiz removed (students can still see results)

### Step 3.6: Assign Simulations to Class

**Same process as quizzes:**

1. **Click "Simulations" Tab**
2. **Click "Assign Simulation"**
3. **Select Simulation** (e.g., "Phishing Detection Simulation")
4. **Set Due Date**
5. **Click "Assign"**

#### Types of Simulations Available

- **Phishing Detection**: Identify fake emails
- **Ransomware Response**: React to malware attack
- **Social Engineering**: Resist manipulation
- **Breach Response**: Handle data breach
- **Password Management**: Create secure passwords

### Step 3.7: Assign Training Modules to Class

**Similar process:**

1. **Click "Modules" Tab**
2. **Click "Assign Module"**
3. **Select Module** (e.g., "Cybersecurity Basics")
4. **Set Due Date**
5. **Click "Assign"**

#### Available Modules

- Cybersecurity Fundamentals
- Threat Recognition
- Safe Browsing
- Email Safety
- Device Protection
- Data Privacy

### Step 3.8: View Student Progress

1. **Click Classroom Name**
2. **Click "Analytics" Tab**

#### See Dashboard

**Individual Student:**
- Click student name
- See all assignments:
  * Quiz 1: 90% ✓ Completed
  * Quiz 2: 85% ✓ Completed
  * Simulation 1: Pending (due tomorrow)
- See average score
- See time spent
- See completion rate

**Class Overview:**
- Average score: 82%
- Students with 100%: 3
- Students completing all work: 15/20
- Most time-consuming activity: Simulations (avg 18 min)
- Highest performing students
- Students needing help

### Step 3.9: Archive & Reactivate Classroom

#### Archive (When Course Ends)

1. **Click Classroom**
2. **Click "..." (More Options)**
3. **Click "Archive Classroom"**
4. **Confirm**
   - Class moved to archives
   - Students can still access past work
   - No new work can be assigned

#### Reactivate

1. **Click "Archived Classrooms"**
2. **Find classroom**
3. **Click "Reactivate"**
   - Class is active again

### Step 3.10: Edit Classroom Details

1. **Click Classroom**
2. **Click "Edit Classroom"**
3. **Modify**
   - Class name
   - Description
   - Other details
4. **Click "Save"**

### Step 3.11: Regenerate Classroom Code

If code is compromised or too many people have it:

1. **Click Classroom**
2. **Click "..." (More Options)**
3. **Click "Regenerate Code"**
4. **Confirm**
   - New code generated
   - QR code updates
   - Old code no longer works
   - Share new code with students

### Teacher Features Summary

| Feature | Purpose | Steps |
|---------|---------|-------|
| Create Classroom | Start new class | Dashboard → Create |
| Share Classroom | Invite students | Classroom → Copy Code/QR |
| Manage Students | Add/remove students | Classroom → Students |
| Assign Quizzes | Test knowledge | Classroom → Quizzes → Assign |
| Assign Simulations | Practice scenarios | Classroom → Simulations → Assign |
| Assign Modules | Give training | Classroom → Modules → Assign |
| View Progress | Track students | Classroom → Analytics |
| Archive Class | End course | Classroom → Archive |

---

## 🛡️ Part 4: Admin Features

### What Admins Can Do

Admins manage users, monitor system health, analyze training effectiveness, and generate reports.

### Step 4.1: Login as Admin

1. **Go to Application**
2. **Click Login**
   - Email: `admin@example.com`
   - Password: `password`

3. **You See Admin Dashboard**
   - System statistics
   - Recent activities
   - Reports
   - Settings

### Step 4.2: Manage Users

1. **Click "Users" in Admin Menu**
2. **See User List**
   - All system users
   - Name | Email | Role | Status | Joined Date

#### View User Details

1. **Click User Name**
2. **See Profile**
   - Email
   - Role (Student/Teacher/Admin)
   - Join date
   - Last login
   - Status (active/inactive)
   - Classrooms (if teacher or student)

#### Change User Role

1. **Click User**
2. **Click "Edit"**
3. **Change Role**
   - From: Student
   - To: Teacher (give them teaching ability)
   - Click "Save"

#### Deactivate User

1. **Click User**
2. **Click "Deactivate"**
3. **Confirm**
   - User cannot login
   - Data preserved
   - Can reactivate later

#### Delete User

1. **Click User**
2. **Click "Delete"**
3. **Confirm** (careful - deletes all data!)

### Step 4.3: Create New Users

1. **Click "Users"**
2. **Click "Add New User" Button**
3. **Enter Details**
   - Name
   - Email
   - Role: Student / Teacher / Admin
   - Password (auto-generated or custom)
4. **Click "Create"**
   - Account created
   - Email sent with login info

### Step 4.4: Monitor System Activity

1. **Click "Activity Log"** in Admin Menu
2. **See Recent Actions**
   - User logged in
   - Classroom created
   - Quiz completed
   - Module started
   - etc.

#### Filter Activity

- By User
- By Date Range
- By Activity Type
- By Classroom

#### Export Activity

- Download as CSV
- Download as PDF
- For compliance/auditing

### Step 4.5: View System Statistics

1. **Click "Dashboard"** in Admin Menu
2. **See Metrics**

#### User Statistics
- Total Users: 156
- Teachers: 8
- Students: 145
- Admins: 3
- Active This Week: 142

#### Classroom Statistics
- Total Classrooms: 12
- Active: 10
- Archived: 2
- Total Students Enrolled: 145
- Average Class Size: 12

#### Training Statistics
- Total Quizzes Completed: 487
- Average Quiz Score: 81%
- Total Simulations Run: 234
- Average Simulation Score: 78%
- Modules Completed: 89
- Total Training Hours: 456

#### Engagement
- Daily Active Users: 120
- Weekly Active Users: 142
- Avg Session Duration: 22 minutes
- Return Rate: 78%

### Step 4.6: Research Analytics (Research Questions)

This is the core feature for analyzing training effectiveness!

1. **Click "Research"** in Admin Menu
2. **See Research Dashboard**
   - 4 Research Questions analyzed
   - Data visualizations
   - Key findings

#### Research Question 1: Understanding of Cyber Threats

**Question:** "How does interactive cyber training affect threat understanding?"

**View Results:**

1. **Click "RQ1: Threat Understanding"**
2. **See Metrics**
   - Average Knowledge Gain: 2.3 points
   - Improvement Rate: 95.8%
   - Participants with Gain: 89.7%
   - High Performers: 71.8%
   - Behavioral Change Rate: 88.5%

3. **See Charts**
   - Pre vs Post knowledge scores
   - Distribution of learner levels
   - Threat recognition rates

4. **Top Recognized Threats**
   - Phishing: 92%
   - Malware: 87%
   - Social Engineering: 85%
   - Ransomware: 78%

**What It Means:**
- Students significantly improved their understanding
- Most can now recognize common cyber threats
- Training is effective for threat awareness

#### Research Question 2: Quiz vs Simulation Effectiveness

**Question:** "Which is more effective: quizzes or simulations?"

**View Results:**

1. **Click "RQ2: Quiz vs Simulation"**
2. **See Comparison**

| Metric | Simulations | Quizzes | Winner |
|--------|-------------|---------|--------|
| Engagement | 0.88 | 0.68 | Simulation +29% |
| Time Spent | 18.7 min | 12.3 min | Simulation +52% |
| Knowledge Gain | 2.8 | 1.8 | Simulation +56% |
| Performance Score | 84.6% | 72.4% | Simulation +17% |
| Would Recommend | 94.87% | 79.49% | Simulation +15% |

**Key Finding:**
- **Simulations are significantly more effective** than quizzes
- Students spend more time on simulations
- Students learn more from simulations
- Students prefer simulations

**What It Means:**
- Invest in simulation development
- Use simulations for critical training
- Use quizzes for quick assessments only

#### Research Question 3: Lived Experiences & Perceptions

**Question:** "What are user experiences and perceptions?"

**View Results:**

1. **Click "RQ3: User Experiences"**
2. **See Satisfaction Scores**
   - Usability: 4.6/5 ⭐
   - Relevance: 4.4/5 ⭐
   - Practicality: 4.3/5 ⭐
   - Engagement: 4.2/5 ⭐
   - Overall: 4.4/5 ⭐

3. **See User Feedback**
   - Recommendation Rate: 87.18%
   - Would Use Again: 91.2%

4. **Emerging Themes**
   - Positive Themes:
     * Practical: 23 mentions
     * Realistic: 19 mentions
     * Engaging: 18 mentions
     * Relevant: 16 mentions
     * Helpful: 14 mentions
   
   - Areas to Improve:
     * Some too difficult: 5 mentions
     * Some confusing: 2 mentions

5. **Sample Comments**
   - "This simulation felt so real I got stressed!" - Student A
   - "Finally understand how phishing works" - Student B
   - "Loved the realistic scenarios" - Teacher X

**What It Means:**
- Users are satisfied with training
- Training is perceived as practical
- Need to clarify confusing parts
- Very high recommendation rate

#### Research Question 4: Behavioral Readiness

**Question:** "Are students ready to handle cyber threats?"

**View Results:**

1. **Click "RQ4: Behavioral Readiness"**
2. **See Readiness Levels**
   - High Readiness: 65% (102 participants)
   - Moderate Readiness: 24% (38 participants)
   - Needs Support: 10% (16 participants)

3. **See Behavioral Changes**
   - Behavioral Change Rate: 88.5%
   - Students demonstrating new security behaviors
   - Performance correlation with behavior (+18.7 points)
   - Engagement correlation with behavior (+0.23 points)

4. **Threat Recognition Rate**
   - Can identify threats: 84.6%
   - Can explain proper response: 79.2%
   - Would take preventive action: 91.3%

**What It Means:**
- Most students are ready to protect themselves
- High correlation between training and actual behavior
- Students report taking new protective actions
- Identify at-risk students (10%) for additional support

### Step 4.7: Export Research Data

1. **Click "Research"** Tab
2. **Click "Download Report"**
3. **Choose Format**
   - PDF (formatted report)
   - CSV (raw data for analysis)
   - Excel (spreadsheet)
4. **Click "Export"**
   - File downloads to your computer
   - Use for publications, presentations, or further analysis

### Step 4.8: Generate Reports

1. **Click "Reports"** in Admin Menu
2. **Choose Report Type**

#### Report A: User Training Progress
- All users
- Courses completed
- Scores
- Time spent
- Certificates earned

#### Report B: Classroom Summary
- Each classroom
- Number of students
- Assignments given
- Completion rate
- Average scores

#### Report C: Compliance Report
- Training completion rate
- Date ranges
- User lists
- Certifications
- For regulatory compliance

3. **Generate Report**
   - Takes a few seconds
   - View on screen or download

### Step 4.9: Manage System Settings

1. **Click "Settings"** in Admin Menu
2. **See Settings Options**

#### General Settings
- Site name: "CATS System"
- Logo/branding
- Contact email

#### Email Settings
- Email notifications (on/off)
- Email for new users
- Email for due date reminders
- Email templates

#### Security Settings
- Password requirements
- Session timeout
- Two-factor authentication (on/off)
- IP whitelist

#### API Settings
- API keys for integrations
- Rate limiting
- Allowed origins

3. **Click Settings to Change**
4. **Click "Save"**

### Step 4.10: Manage Backup & Database

1. **Click "System" in Admin Menu**
2. **See System Status**
   - Database status: ✓ Healthy
   - Last backup: May 10, 2:30 AM
   - Disk space: 45GB available
   - Users online: 23

3. **Click "Backup Database"**
   - Creates backup immediately
   - Downloads backup file
   - Can restore later if needed

### Step 4.11: View Audit Log

1. **Click "Audit Log"** in Admin Menu
2. **See All System Changes**
   - Admin created user "John Smith"
   - Quiz "Phishing Awareness" was updated
   - User deleted from classroom
   - etc.

3. **Filter by**
   - Date range
   - User
   - Action type
   - Who made the change

**Why Important:**
- Track who did what (security)
- Rollback changes if needed
- Compliance requirements

### Admin Features Summary

| Feature | Purpose | Access |
|---------|---------|--------|
| Manage Users | Add/edit/remove users | Users menu |
| View Statistics | Monitor system health | Dashboard |
| Research Analytics | Analyze training effectiveness | Research menu |
| Generate Reports | Export training data | Reports menu |
| System Settings | Configure system options | Settings menu |
| Backup Database | Protect data | System menu |
| Audit Log | Track changes | Audit menu |
| Activity Log | Monitor user actions | Activity menu |

---

## 📊 Part 5: Feature Descriptions & How They Work

### A. Quizzes

**Purpose:** Test knowledge retention and understanding

**How It Works:**
1. Teacher creates or selects a quiz
2. Quiz contains multiple questions (multiple choice, true/false, matching)
3. Student answers each question
4. System immediately scores
5. Student sees results and explanations

**Features:**
- Multiple question types
- Immediate feedback
- Score history
- Review past attempts
- Time limits (optional)
- Attempt limits (1, 2, or unlimited)
- Answer explanations
- Grade tracking

**Example Quiz:** "Phishing Awareness"
- Q1: "What is phishing?" → Multiple choice
- Q2: "Is this email a phishing attempt?" → True/False
- Q3: "What should you do?" → Multiple choice
- Student gets 8/10 = 80%

### B. Simulations

**Purpose:** Practice responding to real-world cyber threats

**How It Works:**
1. System presents realistic scenario
2. Student reads situation and instructions
3. Student makes decisions (take action, report, etc.)
4. System provides feedback on each action
5. Shows consequences in real world
6. Student receives score and learning insights

**Features:**
- Realistic scenarios
- Multiple decision paths
- Immediate consequences
- Learning feedback
- Score based on decisions
- Time tracking
- Performance metrics
- Branching scenarios

**Example Simulation:** "Phishing Email Detection"
- Email arrives in inbox
- Student reviews email carefully
- Spots suspicious sender address
- Student reports as phishing
- System: "Correct! You identified the phishing attempt"
- Score: 100%

### C. Training Modules

**Purpose:** Provide foundational knowledge

**How It Works:**
1. Module contains lessons, videos, interactive elements
2. Student progresses through content sequentially
3. Each section has learning objectives
4. Content is bite-sized for engagement
5. Completion tracked

**Features:**
- Structured lessons
- Multimedia content
- Progress tracking
- Completion certificates
- Estimated time
- Learning objectives clear
- Accessible design

**Example Module:** "Cybersecurity Basics"
- Lesson 1: What is Cybersecurity?
- Lesson 2: Common Threats
- Lesson 3: Basic Protections
- Lesson 4: Your Responsibility
- Certificate upon completion

### D. Classrooms

**Purpose:** Organize students and assign resources

**How It Works:**
1. Teacher creates classroom
2. System generates unique code and QR
3. Students join using code/QR/link
4. Teacher assigns quizzes, simulations, modules
5. System tracks student progress
6. Teacher views analytics

**Features:**
- Unique identification (code + QR)
- Easy student enrollment
- Multi-resource assignment
- Progress tracking
- Due date management
- Student removal
- Class archiving
- Analytics dashboard

### E. Progress Tracking

**Purpose:** Monitor learning progress

**What Students See:**
- Completed vs pending assignments
- Scores on all quizzes
- Completion rate
- Time spent on each activity
- Overall progress percentage
- Strengths and areas for improvement

**What Teachers See:**
- Individual student progress
- Class average progress
- Quiz scores (individual and class average)
- Simulation completion rates
- Module completion rates
- Student rankings
- Trend analysis

**What Admins See:**
- System-wide statistics
- Classroom performance
- Teacher effectiveness
- Training effectiveness metrics
- User engagement trends

### F. QR Code Technology

**Purpose:** Make it easy to join classrooms

**How It Works:**
1. Teacher creates classroom → System auto-generates QR code
2. Teacher displays or shares QR code image
3. Student opens app and clicks "Scan QR"
4. Camera opens
5. Student points phone at QR code
6. System reads code and joins student to classroom
7. Done! No typing, no manual process

**Benefits:**
- Fast (2 seconds vs 30 seconds typing)
- Error-free (no mistyped codes)
- Professional
- Works on all smartphones

### G. Research Analytics

**Purpose:** Answer research questions about training effectiveness

**Key Metrics:**
- **Knowledge Gain**: Pre vs post-training knowledge
- **Engagement**: How long students spend and interaction depth
- **Behavioral Change**: Whether students change security behaviors
- **Preference**: Quiz vs Simulation effectiveness
- **Satisfaction**: User satisfaction and recommendations
- **Readiness**: Are students ready to handle threats

**Use Cases:**
- Improve training programs
- Justify training investment
- Show effectiveness to leadership
- Publish research results
- Identify struggling students
- Find best training methods

---

## 🚀 Part 6: Common Workflows

### Workflow 1: Teacher Setting Up a Class (Day 1)

```
Teacher's Day 1 Workflow:

1. Login
   Email: teacher@example.com

2. Click "Create Classroom"
   Name: "Cybersecurity Awareness 2026"
   Description: "Company-wide training"

3. System creates classroom with code

4. Share with students (choose method):
   Option A: Print QR code and display
   Option B: Email classroom code
   Option C: Send join link

5. Students join (happens over next few days)

6. Classroom now has 25 students

Status: ✓ Classroom ready to use
```

### Workflow 2: Student Joining a Class (Day 1)

```
Student's Day 1 Workflow:

1. Go to http://localhost:5173

2. Login
   Email: student1@example.com

3. Click "Join Classroom"

4. Scan teacher's QR code (or enter code)

5. Click "Join"

6. Classroom appears in "My Classrooms"

Status: ✓ Joined classroom
```

### Workflow 3: Teacher Assigning Tasks (Day 2)

```
Teacher's Day 2 Workflow:

1. Click "Cybersecurity Awareness" classroom

2. Click "Quizzes" tab

3. Click "Assign Quiz"
   Choose: "Phishing Awareness Quiz"
   Due: May 15, 11:59 PM
   Attempts: 2
   
4. Click "Assign"

5. 25 students immediately see quiz

6. Students start taking quiz (some today, some tomorrow)

Status: ✓ Quiz assigned to all students
```

### Workflow 4: Student Completing Tasks (Day 2-3)

```
Student's Day 2-3 Workflow:

1. Login

2. Click "My Classrooms"

3. Click "Cybersecurity Awareness"

4. See "Phishing Awareness Quiz" assigned
   Due: May 15

5. Click quiz name

6. Click "Start Quiz"

7. Answer 10 questions (12 minutes)

8. Click "Submit"

9. See result: 8/10 = 80%

10. Read explanations for wrong answers

Status: ✓ Quiz completed
```

### Workflow 5: Teacher Reviewing Results (Day 5)

```
Teacher's Day 5 Workflow:

1. Click classroom

2. Click "Analytics" tab

3. See quiz results
   - Class average: 78%
   - 22/25 students completed
   - 3 students pending

4. Click on struggling student (Jane: 60%)

5. See Jane's score breakdown
   
6. Send Jane a message:
   "Great effort! Let's review phishing signs - join virtual office hours Thursday?"

7. Jane sees message and responds

Status: ✓ Teacher provides support
```

### Workflow 6: Admin Analyzing Training (End of Month)

```
Admin's End-of-Month Workflow:

1. Click "Research" in admin menu

2. View all 4 research questions

3. See findings:
   - RQ1: 95.8% knowledge improvement ✓
   - RQ2: Simulations 56% more effective ✓
   - RQ3: 87% satisfaction rate ✓
   - RQ4: 88.5% behavioral change rate ✓

4. Click "Download Report" → PDF

5. Send to leadership:
   "Training is highly effective - see attached report"

Status: ✓ Admin demonstrates ROI of training
```

---

## 📞 Part 7: Troubleshooting

### Problem: Can't Join Classroom

**Symptoms:** "Invalid code" or "Classroom not found"

**Solution:**
1. Check code spelling (case-insensitive but must be exact)
2. Ask teacher to verify code is still active
3. Ask teacher to regenerate code if expired
4. Try scanning QR code instead

### Problem: Quiz Won't Load

**Symptoms:** Blank screen, spinning loader

**Solution:**
1. Refresh page (F5)
2. Check internet connection
3. Try different browser
4. Clear browser cache and cookies
5. Contact admin if problem persists

### Problem: Teacher Can't Create Classroom

**Symptoms:** "Error creating classroom"

**Solution:**
1. Check user role is "Teacher"
2. Check internet connection
3. Try again in few minutes (server might be busy)
4. Contact admin

### Problem: Student Progress Not Showing

**Symptoms:** Teacher sees 0% for completed work

**Solution:**
1. Student should refresh their page
2. Teacher should refresh analytics page
3. Wait a few minutes for data to sync
4. Check if student actually completed work (not just started)

### Problem: QR Code Doesn't Scan

**Symptoms:** Camera won't focus or read code

**Solution:**
1. Make sure image is clear (print well if printed)
2. Good lighting (not too dark)
3. Phone camera focuses (let it focus for 2-3 seconds)
4. Try downloading QR code and sharing image file
5. Use classroom code instead

### Problem: Forgot Password

**Solution:**
1. Click "Forgot Password" on login page
2. Enter email address
3. Click "Reset Password"
4. Check email for reset link
5. Click link in email
6. Enter new password
7. Login with new password

### Problem: Too Many Failed Logins

**Symptoms:** Account locked, "Too many attempts"

**Solution:**
1. Wait 30 minutes (account automatically unlocks)
2. Contact admin if locked longer
3. Admin can manually unlock in user settings

---

## ✅ Part 8: System Checklist

### Before Going Live

- [ ] Backend installed (`php artisan serve`)
- [ ] Frontend installed (`npm run dev`)
- [ ] Database migrations run (`php artisan migrate`)
- [ ] Test data loaded (`php artisan db:seed --class=ClassroomSeeder`)
- [ ] Can login as admin/teacher/student
- [ ] Can create classroom
- [ ] Can assign quiz
- [ ] Can join classroom as student
- [ ] Can take quiz
- [ ] Can view results

### Regular Maintenance

- [ ] Daily: Check system status
- [ ] Weekly: Review activity log
- [ ] Weekly: Backup database
- [ ] Monthly: Review analytics
- [ ] Monthly: Check for errors in logs
- [ ] Quarterly: Update software

---

## 📈 Part 9: Key Statistics to Track

### Student Engagement Metrics
- **Login Frequency**: How often do students login?
- **Session Duration**: Average time spent per session?
- **Activity Completion**: % of assignments completed?
- **Return Rate**: Do students come back?

### Learning Effectiveness Metrics
- **Quiz Performance**: Average score? Trending up or down?
- **Simulation Performance**: How do students do on simulations?
- **Knowledge Gain**: Pre vs post training knowledge?
- **Time to Mastery**: How long to achieve 80% score?

### Training Quality Metrics
- **Satisfaction Scores**: Do users like the training?
- **Recommendation Rate**: Would they recommend?
- **Completion Rate**: % completing assigned work?
- **Behavioral Change**: Do they actually change behavior?

### System Health Metrics
- **Uptime**: System availability %
- **Response Time**: Pages load quickly?
- **Errors**: Are there bugs?
- **User Load**: Can system handle peak users?

---

## 🎓 Conclusion

The CATS system is a comprehensive cybersecurity awareness training platform that helps:

- **Students** learn cybersecurity through interactive quizzes, simulations, and modules
- **Teachers** organize training delivery through classrooms and track student progress
- **Admins** analyze training effectiveness through research analytics and ensure system health

By following this guide, you can:
1. Set up the system
2. Create classrooms
3. Enroll students
4. Assign training
5. Track progress
6. Analyze effectiveness
7. Make data-driven improvements

**Start today - train your organization on cyber awareness!**

---

## 📚 Additional Resources

- [START_SYSTEM.md](START_SYSTEM.md) - Quick start instructions
- [CLASSROOM_COMPLETE_GUIDE.md](CLASSROOM_COMPLETE_GUIDE.md) - Detailed classroom features
- [RESEARCH_SYSTEM_SUMMARY.md](RESEARCH_SYSTEM_SUMMARY.md) - Research analytics deep dive
- [TEACHER_FEATURE_COMPLETE.md](TEACHER_FEATURE_COMPLETE.md) - Teacher workflow guide

---

*Last Updated: May 11, 2026*
*Version: 1.0*
