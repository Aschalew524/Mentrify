<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'user_type',
        'interests',
        'goals',
        'photo_url',
        'job_title',
        'company',
        'location',
        'category',
        'skills',
        'bio',
        'years_of_experience',
        'availability_hours_week',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get conversations where user is the mentor.
     */
    public function mentorConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'mentor_id');
    }

    /**
     * Get conversations where user is the mentee.
     */
    public function menteeConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'mentee_id');
    }

    /**
     * Get all conversations for this user (both as mentor and mentee).
     */
    public function getAllConversations()
    {
        return Conversation::where('mentor_id', $this->id)
                          ->orWhere('mentee_id', $this->id);
    }

    /**
     * Get messages sent by this user.
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get active conversations for this user.
     */
    public function activeConversations()
    {
        return Conversation::where(function($query) {
            $query->where('mentor_id', $this->id)
                  ->orWhere('mentee_id', $this->id);
        })->where('is_active', true)->with(['mentor', 'mentee', 'lastMessage']);
    }
}
