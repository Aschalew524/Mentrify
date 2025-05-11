<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Session;
use App\Models\Mentorship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Sessions",
 *     description="API Endpoints for managing mentorship sessions"
 * )
 */
class SessionController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/mentorships/{mentorship_id}/sessions",
     *     summary="Schedule a new session",
     *     description="Allows a user (mentor or mentee based on mentorship) to schedule a new session.",
     *     operationId="scheduleSession",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentorship_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentorship",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Session details",
     *         @OA\JsonContent(
     *             required={"title", "scheduled_at", "duration_minutes", "session_type"},
     *             @OA\Property(property="title", type="string", example="Career Development Discussion"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Discuss career goals and next steps."),
     *             @OA\Property(property="scheduled_at", type="string", format="date-time", example="2025-06-15T10:00:00Z"),
     *             @OA\Property(property="duration_minutes", type="integer", example=60),
     *             @OA\Property(property="session_type", type="string", example="Video Call", enum={"Video Call", "In-person", "Chat"}),
     *             @OA\Property(property="join_url", type="string", format="url", nullable=true, example="https://meet.example.com/session123")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Session scheduled successfully", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not part of this mentorship or mentorship not active)"),
     *     @OA\Response(response=404, description="Mentorship not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request, int $mentorship_id): JsonResponse
    {
        $user = Auth::user();
        $mentorship = Mentorship::find($mentorship_id);

        if (!$mentorship) {
            return response()->json(['message' => 'Mentorship not found.'], 404);
        }

        if ($mentorship->mentor_id !== $user->id && $mentorship->mentee_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to schedule sessions for this mentorship.'], 403);
        }

        if ($mentorship->status !== 'active') {
            return response()->json(['message' => 'Sessions can only be scheduled for active mentorships.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after_or_equal:now',
            'duration_minutes' => 'required|integer|min:15',
            'session_type' => ['required', 'string', Rule::in(['Video Call', 'In-person', 'Chat'])],
            'join_url' => 'nullable|url|required_if:session_type,Video Call',
        ]);

        $startTime = Carbon::parse($validatedData['scheduled_at']);
        $endTime = $startTime->copy()->addMinutes($validatedData['duration_minutes']);

        $session = Session::create([
            'mentorship_id' => $mentorship->id,
            'mentor_id' => $mentorship->mentor_id,
            'mentee_id' => $mentorship->mentee_id,
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'session_type' => $validatedData['session_type'],
            'join_url' => $validatedData['join_url'] ?? null,
            'status' => 'upcoming',
            'created_by_id' => $user->id,
        ]);

        return response()->json($session->load(['mentorship.mentor', 'mentorship.mentee', 'createdBy']), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/mentee/sessions",
     *     summary="Get sessions for the authenticated mentee",
     *     operationId="getMenteeSessions",
     *     tags={"Sessions"},
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

        $sessions = $query->orderBy('start_time', 'desc')->get();
        return response()->json($sessions);
    }

    /**
     * @OA\Get(
     *     path="/api/mentor/sessions",
     *     summary="Get sessions for the authenticated mentor",
     *     operationId="getMentorSessions",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="status", in="query", description="Filter by status (upcoming, completed, cancelled)", @OA\Schema(type="string", enum={"upcoming", "completed", "cancelled"})),
     *     @OA\Parameter(name="search", in="query", description="Search by session title or mentee name", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="List of mentor sessions", @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Session"))),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getMentorSessions(Request $request): JsonResponse
    {
        $mentor = Auth::user();
        $query = Session::whereHas('mentorship', function ($q) use ($mentor) {
            $q->where('mentor_id', $mentor->id);
        })->with(['mentorship.mentee:id,first_name,last_name,photo_url', 'createdBy:id,first_name,last_name']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhereHas('mentorship.mentee', function ($subQ) use ($searchTerm) {
                      $subQ->where('first_name', 'like', "%{$searchTerm}%")
                           ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  });
            });
        }
        $sessions = $query->orderBy('start_time', 'desc')->get();
        return response()->json($sessions);
    }

    /**
     * @OA\Get(
     *     path="/api/sessions/{session_id}",
     *     summary="Get a specific session",
     *     operationId="getSessionById",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="session_id", in="path", required=true, description="ID of the session", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Session details", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not part of this session's mentorship)"),
     *     @OA\Response(response=404, description="Session not found")
     * )
     */
    public function show(int $session_id): JsonResponse
    {
        $user = Auth::user();
        $session = Session::with(['mentorship.mentor', 'mentorship.mentee', 'createdBy', 'cancelledBy'])->find($session_id);

        if (!$session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        if ($session->mentorship->mentor_id !== $user->id && $session->mentorship->mentee_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to view this session.'], 403);
        }

        return response()->json($session);
    }

    /**
     * @OA\Put(
     *     path="/api/sessions/{session_id}",
     *     summary="Update/Reschedule a session",
     *     description="Allows a user (creator or participant) to update session details or reschedule it. Only for 'upcoming' sessions.",
     *     operationId="updateSession",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="session_id", in="path", required=true, description="ID of the session", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Session details to update",
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Updated Career Discussion"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Updated agenda."),
     *             @OA\Property(property="scheduled_at", type="string", format="date-time", example="2025-06-16T11:00:00Z"),
     *             @OA\Property(property="duration_minutes", type="integer", example=75),
     *             @OA\Property(property="session_type", type="string", example="Video Call", enum={"Video Call", "In-person", "Chat"}),
     *             @OA\Property(property="join_url", type="string", format="url", nullable=true, example="https://meet.example.com/session456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Session updated successfully", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not authorized or session not 'upcoming')"),
     *     @OA\Response(response=404, description="Session not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $session_id): JsonResponse
    {
        $user = Auth::user();
        $session = Session::with('mentorship')->find($session_id);

        if (!$session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        if ($session->mentorship->mentor_id !== $user->id && $session->mentorship->mentee_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to update this session.'], 403);
        }

        if ($session->status !== 'upcoming') {
            return response()->json(['message' => 'Only upcoming sessions can be updated/rescheduled.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'sometimes|required|date|after_or_equal:now',
            'duration_minutes' => 'sometimes|required|integer|min:15',
            'session_type' => ['sometimes', 'required', 'string', Rule::in(['Video Call', 'In-person', 'Chat'])],
            'join_url' => 'nullable|url|required_if:session_type,Video Call',
        ]);
        
        if (isset($validatedData['status'])) {
            unset($validatedData['status']);
        }
        
        if (isset($validatedData['scheduled_at']) || isset($validatedData['duration_minutes'])) {
            $newStartTime = isset($validatedData['scheduled_at']) ? Carbon::parse($validatedData['scheduled_at']) : $session->start_time;
            $newDuration = $validatedData['duration_minutes'] ?? $session->start_time->diffInMinutes($session->end_time);
            
            $validatedData['start_time'] = $newStartTime;
            $validatedData['end_time'] = $newStartTime->copy()->addMinutes($newDuration);
            
            unset($validatedData['scheduled_at']);
            unset($validatedData['duration_minutes']);
        }

        $session->update($validatedData);

        return response()->json($session->load(['mentorship.mentor', 'mentorship.mentee', 'createdBy']));
    }

    /**
     * @OA\Patch(
     *     path="/api/sessions/{session_id}/cancel",
     *     summary="Cancel an upcoming session",
     *     operationId="cancelSession",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="session_id", in="path", required=true, description="ID of the session", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *          required=false,
     *          description="Reason for cancellation",
     *          @OA\JsonContent(
     *              @OA\Property(property="cancellation_reason", type="string", nullable=true, example="Unexpected conflict.")
     *          )
     *     ),
     *     @OA\Response(response=200, description="Session cancelled successfully", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not authorized or session not 'upcoming')"),
     *     @OA\Response(response=404, description="Session not found")
     * )
     */ 
    public function cancel(Request $request, int $session_id): JsonResponse
    {
        $user = Auth::user();
        $session = Session::with('mentorship')->find($session_id);

        if (!$session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        if ($session->mentorship->mentor_id !== $user->id && $session->mentorship->mentee_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to cancel this session.'], 403);
        }

        if ($session->status !== 'upcoming') {
            return response()->json(['message' => 'Only upcoming sessions can be cancelled.'], 403);
        }

        $session->status = 'cancelled';
        $session->cancelled_by_id = $user->id;
        $session->cancellation_reason = $request->input('cancellation_reason');
        $session->save();

        return response()->json($session->load(['mentorship.mentor', 'mentorship.mentee', 'createdBy', 'cancelledBy']));
    }

    /**
     * @OA\Patch(
     *     path="/api/sessions/{session_id}/complete",
     *     summary="Mark a session as completed",
     *     description="Allows a participant (mentor or mentee) to mark an upcoming or ongoing session as completed.",
     *     operationId="completeSession",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="session_id", in="path", required=true, description="ID of the session", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Session marked as completed", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not authorized or session cannot be marked as completed)"),
     *     @OA\Response(response=404, description="Session not found")
     * )
     */
    public function complete(int $session_id): JsonResponse
    {
        $user = Auth::user();
        $session = Session::with('mentorship')->find($session_id);

        if (!$session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        if ($session->mentorship->mentor_id !== $user->id && $session->mentorship->mentee_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to update this session.'], 403);
        }

        if ($session->status !== 'upcoming') {
             return response()->json(['message' => 'Only upcoming sessions can be marked as completed.'], 403);
        }

        $session->status = 'completed';
        $session->save();

        return response()->json($session->load(['mentorship.mentor', 'mentorship.mentee', 'createdBy']));
    }

    /**
     * @OA\Patch(
     *     path="/api/sessions/{session_id}/notes",
     *     summary="Add or update session notes",
     *     description="Allows the mentor or mentee to add/update their respective notes for a session. The request should contain EITHER 'notes_mentee' OR 'notes_mentor', relevant to the user's role.",
     *     operationId="updateSessionNotes",
     *     tags={"Sessions"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="session_id", in="path", required=true, description="ID of the session", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Notes content. Provide EITHER 'notes_mentee' OR 'notes_mentor'.",
     *         @OA\JsonContent(
     *             oneOf={
     *                 @OA\Schema(type="object", required={"notes_mentee"}, @OA\Property(property="notes_mentee", type="string", nullable=true, example="Key takeaways and action items for me.")),
     *                 @OA\Schema(type="object", required={"notes_mentor"}, @OA\Property(property="notes_mentor", type="string", nullable=true, example="Observations and guidance provided."))
     *             }
     *         )
     *     ),
     *     @OA\Response(response=200, description="Session notes updated successfully", @OA\JsonContent(ref="#/components/schemas/Session")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User not authorized to update notes for this role or session)"),
     *     @OA\Response(response=404, description="Session not found"),
     *     @OA\Response(response=422, description="Validation error (e.g., providing both note types, no notes, or notes for the wrong role)")
     * )
     */
    public function updateNotes(Request $request, int $session_id): JsonResponse
    {
        $user = Auth::user();
        $session = Session::with('mentorship')->find($session_id);

        if (!$session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        $isMentor = $session->mentorship->mentor_id === $user->id;
        $isMentee = $session->mentorship->mentee_id === $user->id;

        if (!$isMentor && !$isMentee) {
            return response()->json(['message' => 'You are not authorized to update notes for this session.'], 403);
        }

        if ($isMentee) {
            if ($request->has('notes_mentor')) {
                return response()->json(['message' => 'Mentees can only submit \'notes_mentee\'.'], 422);
            }
            $validatedData = $request->validate([
                'notes_mentee' => 'present|nullable|string',
            ]);
            $session->notes_mentee = $validatedData['notes_mentee'];
        } elseif ($isMentor) {
            if ($request->has('notes_mentee')) {
                return response()->json(['message' => 'Mentors can only submit \'notes_mentor\'.'], 422);
            }
            $validatedData = $request->validate([
                'notes_mentor' => 'present|nullable|string',
            ]);
            $session->notes_mentor = $validatedData['notes_mentor'];
        }

        $session->save();

        return response()->json($session->load(['mentorship.mentor', 'mentorship.mentee', 'createdBy']));
    }
}
