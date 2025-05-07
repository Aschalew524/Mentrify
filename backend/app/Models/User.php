<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(property="id", type="integer", format="int64", description="User ID"),
 *     @OA\Property(property="first_name", type="string", description="User's first name"),
 *     @OA\Property(property="last_name", type="string", description="User's last name"),
 *     @OA\Property(property="email", type="string", format="email", description="User's email address"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", description="Timestamp of email verification", nullable=true),
 *     @OA\Property(property="user_type", type="string", enum={"mentee", "mentor"}, description="Type of user"),
 *     @OA\Property(property="interests", type="string", description="Mentee's interests (comma-separated or JSON)", nullable=true),
 *     @OA\Property(property="goals", type="string", description="Mentee's goals", nullable=true),
 *     @OA\Property(property="photo_url", type="string", description="Mentor's photo URL", nullable=true),
 *     @OA\Property(property="job_title", type="string", description="Mentor's job title", nullable=true),
 *     @OA\Property(property="company", type="string", description="Mentor's company (optional)", nullable=true),
 *     @OA\Property(property="location", type="string", description="Mentor's location", nullable=true),
 *     @OA\Property(property="category", type="string", description="Mentor's category", nullable=true),
 *     @OA\Property(property="skills", type="string", description="Mentor's skills (comma-separated or JSON)", nullable=true),
 *     @OA\Property(property="bio", type="string", description="Mentor's biography", nullable=true),
 *     @OA\Property(property="years_of_experience", type="integer", description="Mentor's years of experience", nullable=true),
 *     @OA\Property(property="availability_hours_week", type="number", format="float", description="Mentor's availability in hours per week", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time", description="Timestamp of user creation"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", description="Timestamp of last user update")
 * )
 */

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
}
