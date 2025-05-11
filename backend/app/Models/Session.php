<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="Session",
 *     title="Session",
 *     description="Mentoring session model",
 *     @OA\Property(property="id", type="integer", format="int64", description="Session ID"),
 *     @OA\Property(property="mentor_id", type="integer", format="int64", description="ID of the Mentor (User)"),
 *     @OA\Property(property="mentee_id", type="integer", format="int64", description="ID of the Mentee (User)"),
 *     @OA\Property(property="title", type="string", description="Title or main topic of the session"),
 *     @OA\Property(property="description", type="string", nullable=true, description="Detailed description or agenda"),
 *     @OA\Property(property="start_time", type="string", format="date-time", description="Scheduled start time of the session"),
 *     @OA\Property(property="end_time", type="string", format="date-time", description="Scheduled end time of the session"),
 *     @OA\Property(property="status", type="string", enum={"upcoming", "completed", "cancelled", "in_progress"}, description="Status of the session"),
 *     @OA\Property(property="join_url", type="string", nullable=true, description="URL to join the virtual session"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Timestamp of session creation"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Timestamp of last session update"),
 *     @OA\Property(property="mentor", ref="#/components/schemas/User"),
 *     @OA\Property(property="mentee", ref="#/components/schemas/User")
 * )
 */
class Session extends Model
{
    use HasFactory;

    protected $table = 'mentoring_sessions';

    protected $fillable = [
        'mentorship_id',
        'mentor_id',
        'mentee_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'status',
        'join_url',
        'created_by_id',
        'cancelled_by_id',
        'cancellation_reason',
        'session_type',      
        'notes_mentee',      
        'notes_mentor',      
        'duration_minutes',  
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function mentorship(): BelongsTo
    {
        return $this->belongsTo(Mentorship::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function mentee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }

    public function feedback(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Feedback::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by_id');
    }
}