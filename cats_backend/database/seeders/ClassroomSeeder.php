<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Classroom;
use App\Models\ClassroomStudent;
use App\Models\Quiz;
use App\Models\Simulation;
use App\Models\TrainingModule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClassroomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a teacher user
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'John Teacher',
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ]
        );

        // Create student users
        $students = [];
        for ($i = 1; $i <= 5; $i++) {
            $students[] = User::firstOrCreate(
                ['email' => "student{$i}@example.com"],
                [
                    'name' => "Student {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'student',
                ]
            );
        }

        // Create classrooms
        $classroom1 = Classroom::create([
            'teacher_id' => $teacher->id,
            'name' => 'Cybersecurity Fundamentals',
            'description' => 'Learn the basics of cybersecurity and threat awareness',
            'status' => 'active',
        ]);

        $classroom2 = Classroom::create([
            'teacher_id' => $teacher->id,
            'name' => 'Advanced Phishing Detection',
            'description' => 'Master the art of identifying sophisticated phishing attempts',
            'status' => 'active',
        ]);

        // Enroll students in classroom 1
        foreach (array_slice($students, 0, 3) as $student) {
            ClassroomStudent::create([
                'classroom_id' => $classroom1->id,
                'student_id' => $student->id,
                'status' => 'active',
            ]);
        }

        // Enroll students in classroom 2
        foreach (array_slice($students, 2, 3) as $student) {
            ClassroomStudent::create([
                'classroom_id' => $classroom2->id,
                'student_id' => $student->id,
                'status' => 'active',
            ]);
        }

        // Assign resources if they exist
        $quiz = Quiz::first();
        if ($quiz) {
            $classroom1->quizzes()->attach($quiz->id, [
                'due_date' => now()->addDays(7),
                'is_active' => true,
            ]);
        }

        $simulation = Simulation::first();
        if ($simulation) {
            $classroom1->simulations()->attach($simulation->id, [
                'due_date' => now()->addDays(14),
                'is_active' => true,
            ]);
        }

        $module = TrainingModule::first();
        if ($module) {
            $classroom1->modules()->attach($module->id, [
                'due_date' => now()->addDays(10),
                'is_active' => true,
            ]);
        }

        $this->command->info('Classrooms seeded successfully!');
        $this->command->info("Teacher: teacher@example.com / password");
        $this->command->info("Students: student1@example.com to student5@example.com / password");
        $this->command->info("Classroom 1 Code: {$classroom1->code}");
        $this->command->info("Classroom 2 Code: {$classroom2->code}");
    }
}
