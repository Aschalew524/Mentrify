<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // Add this line

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default test user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'user_type' => 'mentee',
                'password' => Hash::make('password'), // Ensure password is set for new user
                'email_verified_at' => now(), // Ensure email is verified
            ]
        );

        // Delete existing mentors before seeding new ones
        User::where('user_type', 'mentor')->delete();

        // Add new mentors with full information
        User::create([
            'first_name' => 'Alex', // New mentor 1
            'last_name' => 'Johnson',
            'email' => 'alex.johnson@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'mentor',
            'photo_url' => '../../assets/images/mentor_alex.jpg', 
            'job_title' => 'Senior Software Engineer',
            'company' => 'Innovatech Ltd.',
            'location' => 'New York, NY',
            'category' => 'Web Development',
            'skills' => 'JavaScript, React, Node.js, Python, Django',
            'bio' => 'Passionate about building scalable web applications and helping others grow in their tech careers. Loves to discuss clean code and architecture.',
            'years_of_experience' => 7,
            'email_verified_at' => now(),
        ]);

        User::create([
            'first_name' => 'Maria', // New mentor 2
            'last_name' => 'Garcia',
            'email' => 'maria.garcia@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'mentor',
            'photo_url' => '../../assets/images/mentor_maria.jpg', 
            'job_title' => 'Product Design Lead',
            'company' => 'Creative Solutions LLC',
            'location' => 'Austin, TX',
            'category' => 'UX/UI Design',
            'skills' => 'User Research, Prototyping, Figma, Design Thinking, Accessibility',
            'bio' => 'Dedicated to creating user-centered designs that solve real-world problems. Enjoys mentoring aspiring designers on portfolio building and interview skills.',
            'years_of_experience' => 9,
            'email_verified_at' => now(),
        ]);

        User::create([
            'first_name' => 'David', // New mentor 3
            'last_name' => 'Lee',
            'email' => 'david.lee@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'mentor',
            'photo_url' => '../../assets/images/mentor_david.jpg', 
            'job_title' => 'Data Science Manager',
            'company' => 'Data Insights Corp.',
            'location' => 'Chicago, IL',
            'category' => 'Data Science & Analytics',
            'skills' => 'Machine Learning, Python, R, SQL, Data Visualization, Statistical Analysis',
            'bio' => 'Expert in leveraging data to drive business decisions. Keen on mentoring individuals interested in data science, machine learning, and AI ethics.',
            'years_of_experience' => 11,
            'email_verified_at' => now(),
        ]);
    }
}
