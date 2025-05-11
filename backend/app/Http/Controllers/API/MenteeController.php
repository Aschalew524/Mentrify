<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Goal;
use App\Models\Mentorship;
use App\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Mentee",
 *     description="API Endpoints for Mentee Operations"
 * )
 */
class MenteeController extends Controller
{
    /**
     * Get mentee dashboard data
     * @OA\Get(
     *     path="/api/mentee/dashboard",
     *     summary="Get mentee dashboard data",
     *     description="Retrieves all necessary data for the mentee dashboard",
     *     operationId="getMenteeDashboard",
     *     tags={"Mentee Dashboard"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Mentee dashboard data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="active_mentors_count", type="integer", example=2),
     *             @OA\Property(property="learning_hours", type="integer", example=16),
     *             @OA\Property(property="goals_completed_count", type="integer", example=5),
     *             @OA\Property(
     *                 property="upcoming_sessions",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Session")
     *             ),
     *             @OA\Property(
     *                 property="past_sessions",
     *                 type="array",
     *                 @OA\Items(
     *                     allOf={
     *                         @OA\Schema(ref="#/components/schemas/Session"),
     *                         @OA\Schema(
     *                             @OA\Property(property="feedback_given", type="boolean", example=false)
     *                         )
     *                     }
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Get count of active mentors
        $activeMentorsCount = Mentorship::where('mentee_id', $user->id)
            ->where('status', 'active')
            ->count();
        
        // Calculate total learning hours from completed sessions
        $completedSessions = Session::where('mentee_id', $user->id)
            ->where('status', 'completed')
            ->get();
        
        $learningHours = 0;
        foreach ($completedSessions as $session) {
            $duration = $session->end_time->diffInHours($session->start_time);
            $learningHours += $duration;
        }
        
        // Get count of completed goals
        $goalsCompletedCount = Goal::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        
        // Get upcoming sessions with mentor details
        $upcomingSessions = Session::with('mentor:id,first_name,last_name,photo_url,job_title')
            ->where('mentee_id', $user->id)
            ->where('status', 'upcoming')
            ->orderBy('start_time', 'asc')
            ->get();
        
        // Get past sessions with mentor details and feedback status
        $pastSessions = Session::with('mentor:id,first_name,last_name,photo_url,job_title')
            ->where('mentee_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('start_time', 'desc')
            ->get();
        
        // Add feedback_given flag to past sessions
        $pastSessions->map(function ($session) use ($user) {
            $feedbackExists = Feedback::where('session_id', $session->id)
                ->where('reviewer_id', $user->id)
                ->exists();
            
            $session->feedback_given = $feedbackExists;
            return $session;
        });
        
        return response()->json([
            'active_mentors_count' => $activeMentorsCount,
            'learning_hours' => $learningHours,
            'goals_completed_count' => $goalsCompletedCount,
            'upcoming_sessions' => $upcomingSessions,
            'past_sessions' => $pastSessions,
        ]);
    }
}