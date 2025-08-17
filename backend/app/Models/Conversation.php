<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @OA\Schema(
 *     schema="Conversation",
 *     title="Conversation",
 *     description="Chat conversation between mentor and mentee",
 *     @OA\Property(property="id", type="integer", format="int64", description="Conversation ID"),
 *     @OA\Property(property="mentorship_id", type="integer", format="int64", description="ID of the associated mentorship"),
 *     @OA\Property(property="mentor_id", type="integer", format="int64", description="ID of the mentor"),
 *     @OA\Property(property="mentee_id", type="integer", format="int64", description="ID of the mentee"),
 *     @OA\Property(property="title", type="string", nullable=true, description="Optional conversation title"),
 *     @OA\Property(property="last_message_at", type="string", format="date-time", nullable=true, description="Timestamp of last message"),
 *     @OA\Property(property="is_active", type="boolean", description="Whether the conversation is active"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Timestamp of conversation creation"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Timestamp of last conversation update"),
 *     @OA\Property(property="mentorship", ref="#/components/schemas/Mentorship"),
 *     @OA\Property(property="mentor", ref="#/components/schemas/User"),
 *     @OA\Property(property="mentee", ref="#/components/schemas/User"),
 *     @OA\Property(property="messages", type="array", @OA\Items(ref="#/components/schemas/Message")),
 *     @OA\Property(property="last_message", ref="#/components/schemas/Message")
 * )
 */
class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentorship_id',
        'mentor_id',
        'mentee_id',
        'title',
        'last_message_at',
        'is_active',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the mentorship that owns the conversation.
     */
    public function mentorship(): BelongsTo
    {
        return $this->belongsTo(Mentorship::class);
    }

    /**
     * Get the mentor in this conversation.
     */
    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    /**
     * Get the mentee in this conversation.
     */
    public function mentee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }

    /**
     * Get all messages for this conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message in this conversation.
     */
    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    /**
     * Get unread messages count for a specific user.
     */
    public function getUnreadCountForUser($userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Check if user is participant in this conversation.
     */
    public function isParticipant($userId): bool
    {
        return $this->mentor_id == $userId || $this->mentee_id == $userId;
    }

    /**
     * Get the other participant in the conversation.
     */
    public function getOtherParticipant($userId): User
    {
        if ($this->mentor_id == $userId) {
            return $this->mentee;
        }
        return $this->mentor;
    }
}
