<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MenteeDashboardController;
use App\Http\Controllers\API\MentorDashboardController;


Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);     

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) { 
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Dashboard endpoints
    Route::get('/mentee/dashboard', [MenteeDashboardController::class, 'index']);
    Route::get('/mentor/dashboard', [MentorDashboardController::class, 'index']);
});