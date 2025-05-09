<?php

namespace App\Models; 

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="Mentorship",
 *     title="Mentorship",
 *     description="Represents an active or past mentorship connection",
 *     @OA\Property(property="id", type="integer", format="int64"),
 *     @OA\Property(property="mentor_id", type="integer", format="int64", description="ID of the Mentor (User)"),
 *     @OA\Property(property="mentee_id", type="integer", format="int64", description="ID of the Mentee (User)"),
 *     @OA\Property(property="status", type="string", enum={"pending", "active", "ended", "rejected"}, description="Status of the mentorship"),
 *     @OA\Property(property="started_at", type="string", format="date-time", nullable=true, description="Timestamp when mentorship became active"),
 *     @OA\Property(property="ended_at", type="string", format="date-time", nullable=true, description="Timestamp when mentorship ended"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Mentorship extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentor_id',
        'mentee_id',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function mentee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }
}
