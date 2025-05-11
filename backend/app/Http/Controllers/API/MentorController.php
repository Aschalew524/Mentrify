<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Mentorship;
use App\Models\Session;
use App\Models\User; // Added User model
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Mentors",
 *     description="API Endpoints for Mentor Operations"
 * )
 */
class MentorController extends Controller // Assuming class name is changed from MentorDashboardController
{
    /**
     * Get mentor dashboard data
     * @OA\Get(
     *     path="/api/mentor/dashboard",
     *     summary="Get mentor dashboard data",
     *     description="Retrieves all necessary data for the mentor dashboard",
     *     operationId="getMentorDashboard",
     *     tags={"Mentors"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Mentor dashboard data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="active_mentees_count", type="integer", example=12),
     *             @OA\Property(property="average_rating", type="number", format="float", example=4.8),
     *             @OA\Property(property="hours_mentored", type="integer", example=48),
     *             @OA\Property(
     *                 property="upcoming_sessions",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Session")
     *             ),
     *             @OA\Property(
     *                 property="recent_feedback",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Feedback")
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
        
        // Get count of active mentees
        $activeMenteesCount = Mentorship::where('mentor_id', $user->id)
            ->where('status', 'active')
            ->count();
        
        // Calculate average rating from feedback
        $averageRating = Feedback::where('reviewee_id', $user->id)
            ->avg('rating') ?? 0;
        
        // Calculate total hours mentored from completed sessions
        $completedSessions = Session::where('mentor_id', $user->id)
            ->where('status', 'completed')
            ->get();
        
        $hoursMentored = 0;
        foreach ($completedSessions as $session) {
            $duration = $session->end_time->diffInHours($session->start_time);
            $hoursMentored += $duration;
        }
        
        // Get upcoming sessions with mentee details
        $upcomingSessions = Session::with('mentee:id,first_name,last_name,photo_url')
            ->where('mentor_id', $user->id)
            ->where('status', 'upcoming')
            ->orderBy('start_time', 'asc')
            ->get();
        
        // Get recent feedback with reviewer (mentee) details
        $recentFeedback = Feedback::with('reviewer:id,first_name,last_name,photo_url')
            ->with('session:id,title,start_time')
            ->where('reviewee_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return response()->json([
            'active_mentees_count' => $activeMenteesCount,
            'average_rating' => round($averageRating, 1),
            'hours_mentored' => $hoursMentored,
            'upcoming_sessions' => $upcomingSessions,
            'recent_feedback' => $recentFeedback,
        ]);
    }

    /**
     * Get all mentors
     * @OA\Get(
     *     path="/api/mentors",
     *     summary="Get all mentors",
     *     description="Retrieves a list of all users with the 'mentor' type.",
     *     operationId="getMentors",
     *     tags={"Mentors"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Mentors retrieved successfully",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMentors(Request $request): JsonResponse
    {
        $mentors = User::where('user_type', 'mentor')
            ->select([
                'id', 
                'first_name', 
                'last_name', 
                'email', 
                'photo_url', 
                'job_title', 
                'company', 
                'location', 
                'category', 
                'skills', 
                'bio', 
                'years_of_experience'
            ])
            ->get();

        return response()->json($mentors);
    }
}