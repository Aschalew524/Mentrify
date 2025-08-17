<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="Message",
 *     title="Message",
 *     description="Chat message model",
 *     @OA\Property(property="id", type="integer", format="int64", description="Message ID"),
 *     @OA\Property(property="conversation_id", type="integer", format="int64", description="ID of the conversation"),
 *     @OA\Property(property="sender_id", type="integer", format="int64", description="ID of the message sender"),
 *     @OA\Property(property="content", type="string", description="Message content"),
 *     @OA\Property(property="type", type="string", enum={"text", "image", "file", "system"}, description="Type of message"),
 *     @OA\Property(property="read_at", type="string", format="date-time", nullable=true, description="Timestamp when message was read"),
 *     @OA\Property(property="is_edited", type="boolean", description="Whether the message has been edited"),
 *     @OA\Property(property="edited_at", type="string", format="date-time", nullable=true, description="Timestamp when message was last edited"),
 *     @OA\Property(property="metadata", type="object", nullable=true, description="Additional message metadata (for files, images, etc.)"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Timestamp of message creation"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Timestamp of last message update"),
 *     @OA\Property(property="conversation", ref="#/components/schemas/Conversation"),
 *     @OA\Property(property="sender", ref="#/components/schemas/User")
 * )
 */
class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'type',
        'read_at',
        'is_edited',
        'edited_at',
        'metadata',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user who sent the message.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Check if the message is read.
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Mark the message as edited.
     */
    public function markAsEdited(): void
    {
        $this->update([
            'is_edited' => true,
            'edited_at' => now(),
        ]);
    }

    /**
     * Scope to get unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope to get messages by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Update conversation's last_message_at when a new message is created
        static::created(function ($message) {
            $message->conversation->update([
                'last_message_at' => $message->created_at,
            ]);
        });
    }
}
