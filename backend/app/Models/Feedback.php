<?php
namespace App\Models; 

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="Feedback",
 *     title="Feedback",
 *     description="Feedback model for sessions",
 *     @OA\Property(property="id", type="integer", format="int64", description="Feedback ID"),
 *     @OA\Property(property="session_id", type="integer", format="int64", description="ID of the session being reviewed"),
 *     @OA\Property(property="reviewer_id", type="integer", format="int64", description="ID of the User giving feedback (usually mentee)"),
 *     @OA\Property(property="reviewee_id", type="integer", format="int64", description="ID of the User being reviewed (usually mentor)"),
 *     @OA\Property(property="rating", type="integer", minimum=1, maximum=5, description="Rating from 1 to 5 stars", nullable=true),
 *     @OA\Property(property="comment", type="string", description="Textual feedback/comment"),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Timestamp of feedback submission"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Timestamp of last feedback update"),
 *     @OA\Property(property="reviewer", ref="#/components/schemas/User"),
 *     @OA\Property(property="session", ref="#/components/schemas/Session")
 * )
 */
class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'comment',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}