<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MenteeController;
use App\Http\Controllers\API\MentorController;
use App\Http\Controllers\API\MentorshipController; // Import MentorshipController
use App\Http\Controllers\API\TaskController; // Import TaskController

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);     

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) { 
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Dashboard endpoints
    Route::get('/mentee/dashboard', [MenteeDantroller::class, 'index']);
    Route::get('/mentor/dashboard', [MentorController::class, 'index']);

    // Mentor listing endpoint
    Route::get('/mentors', [MentorController::class, 'getMentors']);

    // Mentorship connection endpoints
    Route::post('/mentorships/request/{mentor_id}', [MentorshipController::class, 'requestMentorship']);
    Route::put('/mentorships/{mentorship_id}/accept', [MentorshipController::class, 'acceptMentorship']);
    Route::put('/mentorships/{mentorship_id}/reject', [MentorshipController::class, 'rejectMentorship']);
    Route::delete('/mentorships/{mentorship_id}/cancel', [MentorshipController::class, 'cancelMentorshipRequest']);

    // Get active and pending mentorships for mentee
    Route::get('/mentorships/mentee/active', [MentorshipController::class, 'getMenteeActiveMentorships']);
    Route::get('/mentorships/mentee/pending', [MentorshipController::class, 'getMenteePendingMentorships']);

    // Get active and pending mentorships for mentor
    Route::get('/mentorships/mentor/active', [MentorshipController::class, 'getMentorActiveMentorships']);
    Route::get('/mentorships/mentor/pending', [MentorshipController::class, 'getMentorPendingMentorships']);

    // Task Management Endpoints
    Route::post('/mentorships/{mentorship_id}/tasks', [TaskController::class, 'store']); // Mentor creates a task for a mentee in a mentorship
    Route::get('/mentee/tasks', [TaskController::class, 'getMenteeTasks']); // Mentee gets their tasks
    Route::get('/mentor/tasks', [TaskController::class, 'getMentorTasks']); // Mentor gets tasks they assigned
    Route::put('/tasks/{task_id}/status', [TaskController::class, 'updateTaskStatus']); // Mentee updates task status
    Route::get('/tasks/{task_id}', [TaskController::class, 'show']); // Get a specific task (mentor or mentee)
    Route::put('/tasks/{task_id}', [TaskController::class, 'update']); // Mentor updates a task
    Route::delete('/tasks/{task_id}', [TaskController::class, 'destroy']); // Mentor deletes a task
});