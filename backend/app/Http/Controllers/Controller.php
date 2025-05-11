<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Mentrify API",
 *     description="API documentation for the Mentrify platform."
 * )
 * @OA\SecurityScheme(
 *      securityScheme="sanctum",
 *      type="http",
 *      scheme="bearer",
 *      bearerFormat="JWT",
 *      description="Enter token in format (Bearer <token>)"
 * )
 * @OA\Components(
 *     schemas={
 *         @OA\Schema(
 *             schema="User",
 *             title="User",
 *             description="User model",
 *             @OA\Property(property="id", type="integer", format="int64", description="ID of the user"),
 *             @OA\Property(property="first_name", type="string", description="First name"),
 *             @OA\Property(property="last_name", type="string", description="Last name"),
 *             @OA\Property(property="email", type="string", format="email", description="Email address"),
 *             @OA\Property(property="user_type", type="string", enum={"mentor", "mentee"}, description="Type of user"),
 *             @OA\Property(property="photo_url", type="string", nullable=true, description="URL of the user's photo"),
 *             @OA\Property(property="job_title", type="string", nullable=true, description="Job title (for mentors)"),
 *             @OA\Property(property="category", type="string", nullable=true, description="Category (for mentors)"),
 *             @OA\Property(property="created_at", type="string", format="date-time", description="Creation timestamp"),
 *             @OA\Property(property="updated_at", type="string", format="date-time", description="Last update timestamp")
 *         ),
 *         @OA\Schema(
 *             schema="Mentorship",
 *             title="Mentorship",
 *             description="Mentorship model",
 *             @OA\Property(property="id", type="integer", format="int64", description="ID of the mentorship"),
 *             @OA\Property(property="mentor_id", type="integer", format="int64", description="ID of the mentor"),
 *             @OA\Property(property="mentee_id", type="integer", format="int64", description="ID of the mentee"),
 *             @OA\Property(property="status", type="string", enum={"pending", "active", "rejected", "cancelled", "completed"}, description="Status of the mentorship"),
 *             @OA\Property(property="created_at", type="string", format="date-time", description="Creation timestamp"),
 *             @OA\Property(property="updated_at", type="string", format="date-time", description="Last update timestamp")
 *         ),
 *         @OA\Schema(
 *             schema="Task",
 *             title="Task",
 *             description="Task model",
 *             @OA\Property(property="id", type="integer", format="int64", description="ID of the task"),
 *             @OA\Property(property="title", type="string", description="Title of the task"),
 *             @OA\Property(property="description", type="string", description="Description of the task"),
 *             @OA\Property(property="due_date", type="string", format="date-time", description="Due date of the task", nullable=true),
 *             @OA\Property(property="status", type="string", enum={"pending", "in_progress", "completed"}, description="Status of the task"),
 *             @OA\Property(property="mentorship_id", type="integer", format="int64", description="ID of the mentorship this task belongs to"),
 *             @OA\Property(property="assigned_by", type="integer", format="int64", description="ID of the user (mentor) who assigned the task"),
 *             @OA\Property(property="assigned_to", type="integer", format="int64", description="ID of the user (mentee) to whom the task is assigned"),
 *             @OA\Property(property="created_at", type="string", format="date-time", description="Creation timestamp"),
 *             @OA\Property(property="updated_at", type="string", format="date-time", description="Last update timestamp"),
 *             @OA\Property(
 *                 property="assigner",
 *                 description="The user (mentor) who assigned the task (loaded when requested)",
 *                 ref="#/components/schemas/User",
 *                 nullable=true
 *             ),
 *             @OA\Property(
 *                 property="assignee",
 *                 description="The user (mentee) to whom the task is assigned (loaded when requested)",
 *                 ref="#/components/schemas/User",
 *                 nullable=true
 *             ),
 *             @OA\Property(
 *                 property="mentorship",
 *                 description="The mentorship this task belongs to (loaded when requested)",
 *                 ref="#/components/schemas/Mentorship",
 *                 nullable=true
 *             )
 *         )
 *     }
 * )
 */
abstract class Controller
{
    //
}
