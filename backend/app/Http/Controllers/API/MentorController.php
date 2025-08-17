<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
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
     *             ),
     *             @OA\Property(
     *                 property="recent_conversations",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Conversation")
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
        
        // Get recent conversations with mentees
        $recentConversations = Conversation::with(['mentee:id,first_name,last_name,photo_url'])
            ->where('mentor_id', $user->id)
            ->where('is_active', true)
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($conversation) use ($user) {
                $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);
                return $conversation;
            });
        
        return response()->json([
            'active_mentees_count' => $activeMenteesCount,
            'average_rating' => round($averageRating, 1),
            'hours_mentored' => $hoursMentored,
            'upcoming_sessions' => $upcomingSessions,
            'recent_feedback' => $recentFeedback,
            'recent_conversations' => $recentConversations,
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

    /**
     * Get user details by ID
     * @OA\Get(
     *     path="/api/mentor/details/{id}",
     *     summary="Get user details by ID for a mentor",
     *     description="Retrieves user details for the given ID. Accessible by any authenticated user.",
     *     operationId="getMentorDetailsById",
     *     tags={"Mentors"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the user to retrieve",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User details retrieved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found"
     *     )
     * )
     */
    public function getUserDetails(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        // Add any specific authorization logic if needed, e.g. a mentor can only see their own or their mentees' profile.
        return response()->json($user);
    }
}