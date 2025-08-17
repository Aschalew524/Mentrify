<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Events\MessageRead;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Mentorship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * @OA\Tag(
 *     name="Chat",
 *     description="API Endpoints for Chat functionality"
 * )
 */
class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     * @OA\Get(
     *     path="/api/conversations",
     *     summary="Get user's conversations",
     *     description="Retrieves all conversations for the authenticated user",
     *     operationId="getConversations",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Conversations retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Conversations retrieved successfully"),
     *             @OA\Property(
     *                 property="conversations",
     *                 type="array",
     *                 @OA\Items(
     *                     allOf={
     *                         @OA\Schema(ref="#/components/schemas/Conversation"),
     *                         @OA\Schema(
     *                             @OA\Property(property="unread_count", type="integer", example=3),
     *                             @OA\Property(property="other_participant", ref="#/components/schemas/User")
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
        
        $conversations = Conversation::where(function($query) use ($user) {
            $query->where('mentor_id', $user->id)
                  ->orWhere('mentee_id', $user->id);
        })
        ->where('is_active', true)
        ->with(['mentor:id,first_name,last_name,photo_url,job_title', 
                'mentee:id,first_name,last_name,photo_url', 
                'mentorship:id,status'])
        ->orderBy('last_message_at', 'desc')
        ->get();

        // Add unread count and other participant info
        $conversations->map(function ($conversation) use ($user) {
            $conversation->unread_count = $conversation->getUnreadCountForUser($user->id);
            $conversation->other_participant = $conversation->getOtherParticipant($user->id);
            return $conversation;
        });

        return response()->json([
            'status' => true,
            'message' => 'Conversations retrieved successfully',
            'conversations' => $conversations,
        ]);
    }

    /**
     * Create a new conversation
     * @OA\Post(
     *     path="/api/conversations",
     *     summary="Create a new conversation",
     *     description="Creates a new conversation between mentor and mentee",
     *     operationId="createConversation",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"mentorship_id"},
     *             @OA\Property(property="mentorship_id", type="integer", example=1),
     *             @OA\Property(property="title", type="string", example="Let's discuss your goals")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Conversation created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Conversation created successfully"),
     *             @OA\Property(property="conversation", ref="#/components/schemas/Conversation")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation Error"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to create conversation for this mentorship"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mentorship_id' => 'required|integer|exists:mentorships,id',
            'title' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $mentorship = Mentorship::findOrFail($request->mentorship_id);

        // Check if user is part of this mentorship
        if ($mentorship->mentor_id !== $user->id && $mentorship->mentee_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to create conversation for this mentorship',
            ], 403);
        }

        // Check if mentorship is active
        if ($mentorship->status !== 'active') {
            return response()->json([
                'status' => false,
                'message' => 'Can only create conversations for active mentorships',
            ], 422);
        }

        // Check if conversation already exists
        $existingConversation = Conversation::where('mentorship_id', $mentorship->id)->first();
        if ($existingConversation) {
            return response()->json([
                'status' => true,
                'message' => 'Conversation already exists',
                'conversation' => $existingConversation->load(['mentor', 'mentee']),
            ]);
        }

        $conversation = Conversation::create([
            'mentorship_id' => $mentorship->id,
            'mentor_id' => $mentorship->mentor_id,
            'mentee_id' => $mentorship->mentee_id,
            'title' => $request->title,
            'is_active' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Conversation created successfully',
            'conversation' => $conversation->load(['mentor', 'mentee']),
        ], 201);
    }

    /**
     * Get conversation details
     * @OA\Get(
     *     path="/api/conversations/{id}",
     *     summary="Get conversation details",
     *     description="Retrieves details of a specific conversation",
     *     operationId="getConversation",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Conversation ID"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Conversation retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Conversation retrieved successfully"),
     *             @OA\Property(property="conversation", ref="#/components/schemas/Conversation")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conversation not found"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to access this conversation"
     *     )
     * )
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        
        $conversation = Conversation::with(['mentor', 'mentee', 'mentorship'])
            ->findOrFail($id);

        // Check if user is participant in this conversation
        if (!$conversation->isParticipant($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to access this conversation',
            ], 403);
        }

        return response()->json([
            'status' => true,
            'message' => 'Conversation retrieved successfully',
            'conversation' => $conversation,
        ]);
    }

    /**
     * Get messages for a conversation
     * @OA\Get(
     *     path="/api/conversations/{id}/messages",
     *     summary="Get conversation messages",
     *     description="Retrieves messages for a specific conversation with pagination",
     *     operationId="getConversationMessages",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Conversation ID"
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         @OA\Schema(type="integer", default=1),
     *         description="Page number for pagination"
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         @OA\Schema(type="integer", default=50, maximum=100),
     *         description="Number of messages per page"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Messages retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Messages retrieved successfully"),
     *             @OA\Property(
     *                 property="messages",
     *                 type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Message")),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=50),
     *                 @OA\Property(property="total", type="integer", example=234)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conversation not found"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to access this conversation"
     *     )
     * )
     */
    public function getMessages(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        $conversation = Conversation::findOrFail($id);

        // Check if user is participant in this conversation
        if (!$conversation->isParticipant($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to access this conversation',
            ], 403);
        }

        $perPage = min($request->get('per_page', 50), 100);
        
        $messages = $conversation->messages()
            ->with('sender:id,first_name,last_name,photo_url')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => true,
            'message' => 'Messages retrieved successfully',
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message
     * @OA\Post(
     *     path="/api/conversations/{id}/messages",
     *     summary="Send a message",
     *     description="Sends a new message in a conversation",
     *     operationId="sendMessage",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Conversation ID"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="content", type="string", example="Hello! How are you doing?"),
     *             @OA\Property(property="type", type="string", enum={"text", "image", "file"}, default="text")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Message sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Message sent successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Message")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation Error"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to send message in this conversation"
     *     )
     * )
     */
    public function sendMessage(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
            'type' => ['string', Rule::in(['text', 'image', 'file'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $conversation = Conversation::findOrFail($id);

        // Check if user is participant in this conversation
        if (!$conversation->isParticipant($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to send message in this conversation',
            ], 403);
        }

        // Check if conversation is active
        if (!$conversation->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot send messages in inactive conversation',
            ], 422);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $request->content,
            'type' => $request->get('type', 'text'),
        ]);

        $message->load('sender:id,first_name,last_name,photo_url');

        // Broadcast message event for real-time updates
        broadcast(new MessageSent($message));

        return response()->json([
            'status' => true,
            'message' => 'Message sent successfully',
            'data' => $message,
        ], 201);
    }

    /**
     * Mark message as read
     * @OA\Patch(
     *     path="/api/messages/{id}/read",
     *     summary="Mark message as read",
     *     description="Marks a specific message as read",
     *     operationId="markMessageRead",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Message ID"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Message marked as read",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Message marked as read")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Message not found"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to mark this message as read"
     *     )
     * )
     */
    public function markAsRead($messageId): JsonResponse
    {
        $user = Auth::user();
        $message = Message::with('conversation')->findOrFail($messageId);

        // Check if user is participant in this conversation and not the sender
        if (!$message->conversation->isParticipant($user->id) || $message->sender_id === $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to mark this message as read',
            ], 403);
        }

        $message->markAsRead();

        // Broadcast message read event
        broadcast(new MessageRead($message, $user->id));

        return response()->json([
            'status' => true,
            'message' => 'Message marked as read',
        ]);
    }

    /**
     * Mark all messages in conversation as read
     * @OA\Patch(
     *     path="/api/conversations/{id}/read",
     *     summary="Mark all messages as read",
     *     description="Marks all unread messages in a conversation as read",
     *     operationId="markConversationRead",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="Conversation ID"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="All messages marked as read",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="All messages marked as read"),
     *             @OA\Property(property="marked_count", type="integer", example=5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conversation not found"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized to access this conversation"
     *     )
     * )
     */
    public function markConversationAsRead($id): JsonResponse
    {
        $user = Auth::user();
        $conversation = Conversation::findOrFail($id);

        // Check if user is participant in this conversation
        if (!$conversation->isParticipant($user->id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to access this conversation',
            ], 403);
        }

        $markedCount = $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => true,
            'message' => 'All messages marked as read',
            'marked_count' => $markedCount,
        ]);
    }
}
