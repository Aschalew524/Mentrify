<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mentorship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Mentorships",
 *     description="API Endpoints for managing mentorship connections"
 * )
 */
class MentorshipController extends Controller
{
    /**
     * Request a mentorship.
     * @OA\Post(
     *     path="/api/mentorships/request/{mentor_id}",
     *     summary="Request a mentorship",
     *     description="Allows an authenticated user to request mentorship from a mentor.",
     *     operationId="requestMentorship",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentor_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentor to request mentorship from",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Mentorship request created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Mentorship")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Mentor not found"
     *     )
     * )
     */
    public function requestMentorship(Request $request, int $mentor_id): JsonResponse
    {
        $mentee = Auth::user();
        $mentor = User::find($mentor_id);

        if (!$mentor) {
            return response()->json(['message' => 'Mentor not found.'], 404);
        }

        $mentorship = Mentorship::create([
            'mentee_id' => $mentee->id,
            'mentor_id' => $mentor_id,
            'status' => 'pending',
        ]);

        return response()->json($mentorship, 201);
    }

    /**
     * Accept a pending mentorship request.
     * @OA\Put(
     *     path="/api/mentorships/{mentorship_id}/accept",
     *     summary="Accept a mentorship request",
     *     description="Allows an authenticated mentor to accept a pending mentorship request.",
     *     operationId="acceptMentorship",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentorship_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentorship request to accept",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Mentorship request accepted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Mentorship")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (e.g., user is not the designated mentor or request is not pending)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Mentorship request not found"
     *     )
     * )
     */
    public function acceptMentorship(Request $request, int $mentorship_id): JsonResponse
    {
        $mentor = Auth::user();
        $mentorship = Mentorship::find($mentorship_id);

        if (!$mentorship) {
            return response()->json(['message' => 'Mentorship request not found.'], 404);
        }

        if ($mentorship->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'You are not authorized to accept this request.'], 403);
        }

        if ($mentorship->status !== 'pending') {
            return response()->json(['message' => 'This mentorship request is not pending.'], 403);
        }

        $mentorship->status = 'active';
        $mentorship->save();

        return response()->json($mentorship);
    }

    /**
     * Reject a pending mentorship request.
     * @OA\Put(
     *     path="/api/mentorships/{mentorship_id}/reject",
     *     summary="Reject a mentorship request",
     *     description="Allows an authenticated mentor to reject a pending mentorship request.",
     *     operationId="rejectMentorship",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentorship_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentorship request to reject",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Mentorship request rejected successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Mentorship")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (e.g., user is not the designated mentor or request is not pending)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Mentorship request not found"
     *     )
     * )
     */
    public function rejectMentorship(Request $request, int $mentorship_id): JsonResponse
    {
        $mentor = Auth::user();
        $mentorship = Mentorship::find($mentorship_id);

        if (!$mentorship) {
            return response()->json(['message' => 'Mentorship request not found.'], 404);
        }

        if ($mentorship->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'You are not authorized to reject this request.'], 403);
        }

        if ($mentorship->status !== 'pending') {
            return response()->json(['message' => 'This mentorship request is not pending.'], 403);
        }

        $mentorship->status = 'rejected';
        $mentorship->save();

        return response()->json($mentorship);
    }

    /**
     * Cancel a pending mentorship request.
     * @OA\Delete(
     *     path="/api/mentorships/{mentorship_id}/cancel",
     *     summary="Cancel a mentorship request",
     *     description="Allows an authenticated mentee to cancel their pending mentorship request.",
     *     operationId="cancelMentorshipRequest",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentorship_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentorship request to cancel",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Mentorship request cancelled successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Mentorship")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (e.g., user is not the mentee who made the request or request is not pending)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Mentorship request not found"
     *     )
     * )
     */
    public function cancelMentorshipRequest(Request $request, int $mentorship_id): JsonResponse
    {
        $mentee = Auth::user();
        $mentorship = Mentorship::find($mentorship_id);

        if (!$mentorship) {
            return response()->json(['message' => 'Mentorship request not found.'], 404);
        }

        if ($mentorship->mentee_id !== $mentee->id) {
            return response()->json(['message' => 'You are not authorized to cancel this request.'], 403);
        }

        if ($mentorship->status !== 'pending') {
            return response()->json(['message' => 'This mentorship request cannot be cancelled as it is not pending.'], 403);
        }

        $mentorship->delete();

        return response()->json(['message' => 'Mentorship request successfully cancelled.', 'data' => $mentorship]);
    }

    /**
     * Get connected mentors for the authenticated mentee.
     * @OA\Get(
     *     path="/api/mentorships/mentee/active",
     *     summary="Get connected mentors for the authenticated mentee",
     *     description="Retrieves a list of active mentorships where the authenticated user is the mentee.",
     *     operationId="getMenteeActiveMentorships",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved active mentorships",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Mentorship"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMenteeActiveMentorships(Request $request): JsonResponse
    {
        $mentee = Auth::user();
        $mentorships = Mentorship::where('mentee_id', $mentee->id)
            ->where('status', 'active')
            ->with('mentor')
            ->get();

        return response()->json($mentorships);
    }

    /**
     * Get pending mentorship requests for the authenticated mentee.
     * @OA\Get(
     *     path="/api/mentorships/mentee/pending",
     *     summary="Get pending mentorship requests for the authenticated mentee",
     *     description="Retrieves a list of pending mentorship requests where the authenticated user is the mentee.",
     *     operationId="getMenteePendingMentorships",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved pending mentorships",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Mentorship"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMenteePendingMentorships(Request $request): JsonResponse
    {
        $mentee = Auth::user();
        $mentorships = Mentorship::where('mentee_id', $mentee->id)
            ->where('status', 'pending')
            ->with('mentor')
            ->get();

        return response()->json($mentorships);
    }

    /**
     * Get connected mentees for the authenticated mentor.
     * @OA\Get(
     *     path="/api/mentorships/mentor/active",
     *     summary="Get connected mentees for the authenticated mentor",
     *     description="Retrieves a list of active mentorships where the authenticated user is the mentor.",
     *     operationId="getMentorActiveMentorships",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved active mentorships",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Mentorship"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMentorActiveMentorships(Request $request): JsonResponse
    {
        $mentor = Auth::user();
        $mentorships = Mentorship::where('mentor_id', $mentor->id)
            ->where('status', 'active')
            ->with('mentee')
            ->get();

        return response()->json($mentorships);
    }

    /**
     * Get pending mentorship requests for the authenticated mentor.
     * @OA\Get(
     *     path="/api/mentorships/mentor/pending",
     *     summary="Get pending mentorship requests for the authenticated mentor",
     *     description="Retrieves a list of pending mentorship requests where the authenticated user is the mentor.",
     *     operationId="getMentorPendingMentorships",
     *     tags={"Mentorships"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved pending mentorships",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Mentorship"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMentorPendingMentorships(Request $request): JsonResponse
    {
        $mentor = Auth::user();
        $mentorships = Mentorship::where('mentor_id', $mentor->id)
            ->where('status', 'pending')
            ->with('mentee')
            ->get();

        return response()->json($mentorships);
    }
}