<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Feedback;
use App\Models\Goal;
use App\Models\Mentorship;
use App\Models\Session;
use App\Models\User;
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
     *     tags={"Mentees"},
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
        
        // Get recent conversations with mentors
        $recentConversations = Conversation::with(['mentor:id,first_name,last_name,photo_url,job_title'])
            ->where('mentee_id', $user->id)
            ->where('is_active', true)
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($conversation) use ($user) {
                $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);
                return $conversation;
            });
        
        return response()->json([
            'active_mentors_count' => $activeMentorsCount,
            'learning_hours' => $learningHours,
            'goals_completed_count' => $goalsCompletedCount,
            'upcoming_sessions' => $upcomingSessions,
            'past_sessions' => $pastSessions,
            'recent_conversations' => $recentConversations,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/mentee/sessions",
     *     summary="Get sessions for the authenticated mentee",
     *     operationId="getMenteeSessions",
     *     tags={"Mentees"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="status", in="query", description="Filter by status (upcoming, completed, cancelled)", @OA\Schema(type="string", enum={"upcoming", "completed", "cancelled"})),
     *     @OA\Parameter(name="search", in="query", description="Search by session title or mentor name", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="List of mentee sessions", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Session"))),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getMenteeSessions(Request $request): JsonResponse
    {
        $mentee = Auth::user();
        $query = Session::whereHas('mentorship', function ($q) use ($mentee) {
            $q->where('mentee_id', $mentee->id);
        })->with(['mentorship.mentor:id,first_name,last_name,photo_url', 'createdBy:id,first_name,last_name']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhereHas('mentorship.mentor', function ($subQ) use ($searchTerm) {
                      $subQ->where('first_name', 'like', "%{$searchTerm}%")
                           ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $sessions = $query->orderBy('scheduled_at', 'desc')->get();
        return response()->json($sessions);
    }

    /**
     * Get user details by ID
     * @OA\Get(
     *     path="/api/mentee/details/{id}",
     *     summary="Get user details by ID for a mentee",
     *     description="Retrieves user details for the given ID. Accessible by any authenticated user.",
     *     operationId="getMenteeDetailsById",
     *     tags={"Mentees"},
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
        // Add any specific authorization logic if needed, e.g. a mentee can only see their own or their mentor's profile.
        return response()->json($user);
    }
}