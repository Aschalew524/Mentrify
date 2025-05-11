<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'due_date',
        'status',
        'mentorship_id',
        'assigned_by',
        'assigned_to',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'datetime',
    ];

    /**
     * Get the mentorship that this task belongs to.
     */
    public function mentorship(): BelongsTo
    {
        return $this->belongsTo(Mentorship::class);
    }

    /**
     * Get the user who assigned this task (mentor).
     */
    public function assigner(): BelongsTo // Changed from assignedBy to assigner to avoid conflict with assigned_by attribute
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the user to whom this task is assigned (mentee).
     */
    public function assignee(): BelongsTo // Changed from assignedTo to assignee to avoid conflict with assigned_to attribute
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
