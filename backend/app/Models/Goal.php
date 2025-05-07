<?php


namespace App\Models; 

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
/**
 * @OA\Schema(
 *     schema="Goal",
 *     title="Goal",
 *     description="Mentee's personal or professional goal",
 *     @OA\Property(property="id", type="integer", format="int64"),
 *     @OA\Property(property="user_id", type="integer", format="int64", description="ID of the User (Mentee) this goal belongs to"),
 *     @OA\Property(property="title", type="string", description="Title of the goal"),
 *     @OA\Property(property="description", type="string", nullable=true, description="Detailed description of the goal"),
 *     @OA\Property(property="status", type="string", enum={"todo", "in_progress", "completed", "on_hold"}, default="todo", description="Current status of the goal"),
 *     @OA\Property(property="due_date", type="string", format="date", nullable=true, description="Optional due date for the goal"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}