<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Mentorship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * @OA\Tag(
 *     name="Tasks",
 *     description="API Endpoints for managing tasks"
 * )
 */
class TaskController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/mentorships/{mentorship_id}/tasks",
     *     summary="Create a new task for a mentee",
     *     description="Allows a mentor to create a new task for a mentee within a specific mentorship.",
     *     operationId="createTask",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="mentorship_id",
     *         in="path",
     *         required=true,
     *         description="ID of the mentorship",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Task details",
     *         @OA\JsonContent(
     *             required={"title", "description"},
     *             @OA\Property(property="title", type="string", example="Complete Chapter 1"),
     *             @OA\Property(property="description", type="string", example="Read and summarize the first chapter of the book."),
     *             @OA\Property(property="due_date", type="string", format="date-time", example="2025-12-31T23:59:59Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Task created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (User is not the mentor of this mentorship)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Mentorship not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(Request $request, int $mentorship_id): JsonResponse
    {
        $mentor = Auth::user();
        $mentorship = Mentorship::find($mentorship_id);

        if (!$mentorship) {
            return response()->json(['message' => 'Mentorship not found.'], 404);
        }

        if ($mentorship->mentor_id !== $mentor->id) {
            return response()->json(['message' => 'You are not authorized to create tasks for this mentorship.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'nullable|date|after_or_equal:today',
        ]);

        $task = Task::create([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'due_date' => $validatedData['due_date'] ?? null,
            'mentorship_id' => $mentorship->id,
            'assigned_by' => $mentor->id,
            'assigned_to' => $mentorship->mentee_id,
            'status' => 'pending',
        ]);

        return response()->json($task, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/mentee/tasks",
     *     summary="Get tasks assigned to the authenticated mentee",
     *     description="Retrieves a list of tasks assigned to the currently authenticated mentee.",
     *     operationId="getMenteeTasks",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter tasks by status (e.g., pending, in_progress, completed)",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved mentee tasks",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Task"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMenteeTasks(Request $request): JsonResponse
    {
        $mentee = Auth::user();
        $query = Task::where('assigned_to', $mentee->id)->with(['assigner:id,first_name,last_name,photo_url', 'mentorship']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->orderBy('due_date', 'asc')->orderBy('created_at', 'desc')->get();

        return response()->json($tasks);
    }

    /**
     * @OA\Get(
     *     path="/api/mentor/tasks",
     *     summary="Get tasks assigned by the authenticated mentor",
     *     description="Retrieves a list of tasks assigned by the currently authenticated mentor.",
     *     operationId="getMentorTasks",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *      @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter tasks by status (e.g., pending, in_progress, completed)",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="mentee_id",
     *         in="query",
     *         description="Filter tasks by a specific mentee ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved mentor tasks",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Task"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function getMentorTasks(Request $request): JsonResponse
    {
        $mentor = Auth::user();
        $query = Task::where('assigned_by', $mentor->id)->with(['assignee:id,first_name,last_name,photo_url', 'mentorship']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('mentee_id')) {
            $query->where('assigned_to', $request->mentee_id);
        }

        $tasks = $query->orderBy('due_date', 'asc')->orderBy('created_at', 'desc')->get();

        return response()->json($tasks);
    }

    /**
     * @OA\Put(
     *     path="/api/tasks/{task_id}/status",
     *     summary="Update task status (Mentee)",
     *     description="Allows a mentee to update the status of their assigned task.",
     *     operationId="updateTaskStatus",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="task_id",
     *         in="path",
     *         required=true,
     *         description="ID of the task to update",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="New status for the task",
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", example="in_progress", enum={"pending", "in_progress", "completed"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task status updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (User is not assigned to this task)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Task not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function updateTaskStatus(Request $request, int $task_id): JsonResponse
    {
        $mentee = Auth::user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        if ($task->assigned_to !== $mentee->id) {
            return response()->json(['message' => 'You are not authorized to update this task.'], 403);
        }

        $validatedData = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'in_progress', 'completed'])],
        ]);

        $task->status = $validatedData['status'];
        $task->save();

        return response()->json($task);
    }

    /**
     * @OA\Get(
     *     path="/api/tasks/{task_id}",
     *     summary="Get a specific task",
     *     description="Retrieves details of a specific task. Accessible by the mentor who assigned it or the mentee it's assigned to.",
     *     operationId="getTaskById",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="task_id",
     *         in="path",
     *         required=true,
     *         description="ID of the task",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task details retrieved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden (User is not authorized to view this task)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Task not found"
     *     )
     * )
     */
    public function show(int $task_id): JsonResponse
    {
        $user = Auth::user();
        $task = Task::with(['assigner:id,first_name,last_name,photo_url', 'assignee:id,first_name,last_name,photo_url', 'mentorship'])->find($task_id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        // Check if the user is either the mentor who assigned the task or the mentee it's assigned to
        if ($task->assigned_by !== $user->id && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'You are not authorized to view this task.'], 403);
        }

        return response()->json($task);
    }

    /**
     * @OA\Put(
     *     path="/api/tasks/{task_id}",
     *     summary="Update a task (Mentor)",
     *     description="Allows a mentor to update the details of a task they assigned.",
     *     operationId="updateTask",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="task_id",
     *         in="path",
     *         required=true,
     *         description="ID of the task to update",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Task details to update",
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Complete Chapter 1 & 2"),
     *             @OA\Property(property="description", type="string", example="Read and summarize the first two chapters."),
     *             @OA\Property(property="due_date", type="string", format="date-time", example="2026-01-15T23:59:59Z"),
     *             @OA\Property(property="status", type="string", example="pending", enum={"pending", "in_progress", "completed"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Task")
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User is not the mentor who assigned this task)"),
     *     @OA\Response(response=404, description="Task not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $task_id): JsonResponse
    {
        $mentor = Auth::user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        if ($task->assigned_by !== $mentor->id) {
            return response()->json(['message' => 'You are not authorized to update this task.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'due_date' => 'nullable|date|after_or_equal:today',
            'status' => ['sometimes','required', 'string', Rule::in(['pending', 'in_progress', 'completed'])],
        ]);

        $task->update($validatedData);

        return response()->json($task);
    }

    /**
     * @OA\Delete(
     *     path="/api/tasks/{task_id}",
     *     summary="Delete a task (Mentor)",
     *     description="Allows a mentor to delete a task they assigned.",
     *     operationId="deleteTask",
     *     tags={"Tasks"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="task_id",
     *         in="path",
     *         required=true,
     *         description="ID of the task to delete",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Task deleted successfully",
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Task deleted successfully."))
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden (User is not the mentor who assigned this task)"),
     *     @OA\Response(response=404, description="Task not found")
     * )
     */
    public function destroy(int $task_id): JsonResponse
    {
        $mentor = Auth::user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['message' => 'Task not found.'], 404);
        }

        if ($task->assigned_by !== $mentor->id) {
            return response()->json(['message' => 'You are not authorized to delete this task.'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }
}
