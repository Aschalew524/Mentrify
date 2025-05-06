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
 *     title="User Model",
 *     description="User model representing an application user",
 *     @OA\Property(property="id", type="integer", format="int64", description="User ID", example=1),
 *     @OA\Property(property="name", type="string", description="User's full name", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", description="User's email address", example="john.doe@example.com"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true, description="Timestamp of email verification"),
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
        'name',
        'email',
        'password',
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
