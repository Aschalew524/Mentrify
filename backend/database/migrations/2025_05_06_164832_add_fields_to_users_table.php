<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add columns if they don't exist from the original migration
            // Ensure these match what your User model and AuthController expect
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->after('id'); // Or adjust position
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->after('first_name');
            }
            // 'email' and 'password' should already be there
            if (!Schema::hasColumn('users', 'user_type')) {
                $table->string('user_type'); // e.g., 'mentee', 'mentor'
            }
            if (!Schema::hasColumn('users', 'interests')) {
                $table->text('interests')->nullable(); // For mentees
            }
            if (!Schema::hasColumn('users', 'goals')) {
                $table->text('goals')->nullable(); // For mentees
            }
            if (!Schema::hasColumn('users', 'photo_url')) {
                $table->string('photo_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'job_title')) {
                $table->string('job_title')->nullable();
            }
            if (!Schema::hasColumn('users', 'company')) {
                $table->string('company')->nullable();
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable();
            }
            if (!Schema::hasColumn('users', 'category')) {
                $table->string('category')->nullable();
            }
            if (!Schema::hasColumn('users', 'skills')) {
                $table->text('skills')->nullable();
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('users', 'years_of_experience')) {
                $table->integer('years_of_experience')->nullable();
            }
            if (!Schema::hasColumn('users', 'availability_hours_week')) {
                $table->float('availability_hours_week')->nullable();
            }
            // Ensure timestamp columns like email_verified_at, remember_token are present if needed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add dropColumn for each column added in up()
            // $table->dropColumn(['first_name', 'last_name', ...]);
        });
    }
};