<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User; 

/**
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="Mentrify API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="apiAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Bearer token for authentication"
 * )
 */

class AuthController extends Controller
{

    /**
     * @OA\Post(
     *      path="/register",
     *      operationId="registerUser",
     *      tags={"Authentication"},
     *      summary="Register a new user as Mentee or Mentor",
     *      description="Registers a new user (Mentee or Mentor) and returns user data along with an API token.",
     *      @OA\RequestBody(
     *          required=true,
     *          description="User registration details. Provide 'user_type' as 'mentee' or 'mentor'. Fill fields accordingly.",
     *          @OA\JsonContent(
     *              required={"first_name", "last_name", "email", "password", "password_confirmation", "user_type"},
     *              @OA\Property(property="first_name", type="string", example="John"),
     *              @OA\Property(property="last_name", type="string", example="Doe"),
     *              @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *              @OA\Property(property="password", type="string", format="password", example="password123"),
     *              @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *              @OA\Property(property="user_type", type="string", enum={"mentee", "mentor"}, example="mentee"),
     *              @OA\Property(property="interests", type="string", example="Data Science, Product Management", description="Required if user_type is 'mentee'"),
     *              @OA\Property(property="goals", type="string", example="To learn new skills and grow my career.", description="Required if user_type is 'mentee'"),
     *              @OA\Property(property="photo_url", type="string", format="url", example="http://example.com/photo.jpg", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="job_title", type="string", example="Software Engineer", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="company", type="string", example="Tech Solutions Inc.", description="Optional, for mentors"),
     *              @OA\Property(property="location", type="string", example="San Francisco, CA", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="category", type="string", enum={"Engineering", "Product", "Design", "Marketing", "Leadership", "Other"}, example="Engineering", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="skills", type="string", example="PHP, Laravel, API Design", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="bio", type="string", example="Experienced software engineer passionate about mentoring.", description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="years_of_experience", type="integer", example=5, description="Required if user_type is 'mentor'"),
     *              @OA\Property(property="availability_hours_week", type="number", format="float", example=10.5, description="Required if user_type is 'mentor'")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Successful registration",
     *          @OA\JsonContent(
     *              @OA\Property(property="status", type="boolean", example=true),
     *              @OA\Property(property="message", type="string", example="User registered successfully"),
     *              @OA\Property(property="user", type="object", ref="#/components/schemas/User"),
     *              @OA\Property(property="access_token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
     *              @OA\Property(property="token_type", type="string", example="Bearer")
     *          )
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Validation Error"
     *      )
     * )
     */

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users', 
            'password' => 'required|string|min:8|confirmed', 
            'user_type' => 'required|string|in:mentee,mentor',
            
            // Mentee specific fields
            'interests' => 'required_if:user_type,mentee|string',
            'goals' => 'required_if:user_type,mentee|string',

            // Mentor specific fields
            'photo_url' => 'required_if:user_type,mentor|string|max:255', // Consider 'url' rule if it must be a valid URL
            'job_title' => 'required_if:user_type,mentor|string|max:255',
            'company' => 'nullable|string|max:255',
            'location' => 'required_if:user_type,mentor|string|max:255',
            'category' => 'required_if:user_type,mentor|string|in:Engineering,Product,Design,Marketing,Leadership,Other',
            'skills' => 'required_if:user_type,mentor|string',
            'bio' => 'required_if:user_type,mentor|string',
            'years_of_experience' => 'required_if:user_type,mentor|integer|min:0',
            'availability_hours_week' => 'required_if:user_type,mentor|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422); 
        }

        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
        ];

        if ($request->user_type === 'mentee') {
            $userData['interests'] = $request->interests;
            $userData['goals'] = $request->goals;
        } elseif ($request->user_type === 'mentor') {
            $userData['photo_url'] = $request->photo_url;
            $userData['job_title'] = $request->job_title;
            $userData['company'] = $request->company;
            $userData['location'] = $request->location;
            $userData['category'] = $request->category;
            $userData['skills'] = $request->skills;
            $userData['bio'] = $request->bio;
            $userData['years_of_experience'] = $request->years_of_experience;
            $userData['availability_hours_week'] = $request->availability_hours_week;
        }

        $user = User::create($userData);

        $token = $user->createToken('api_token_for_' . $user->first_name)->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'User registered successfully',
            'user' => $user, 
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201); 
    }

    /**
     * @OA\Post(
     *      path="/login",
     *      operationId="loginUser",
     *      tags={"Authentication"},
     *      summary="Login an existing user",
     *      description="Logs in a user and returns user data along with an API token.",
     *      @OA\RequestBody(
     *          required=true,
     *          description="User login credentials",
     *          @OA\JsonContent(
     *              required={"email","password"},
     *              @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *              @OA\Property(property="password", type="string", format="password", example="password123")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful login",
     *          @OA\JsonContent(
     *              @OA\Property(property="status", type="boolean", example=true),
     *              @OA\Property(property="message", type="string", example="Login successful"),
     *              @OA\Property(property="user", type="object", ref="#/components/schemas/User"),
     *              @OA\Property(property="access_token", type="string", example="2|yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"),
     *              @OA\Property(property="token_type", type="string", example="Bearer")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Invalid credentials"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Validation Error"
     *      )
     * )
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid login credentials',
            ], 401); 
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $user->tokens()->delete(); 
        $token = $user->createToken('api_token_for_' . $user->first_name)->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'user' => $user, 
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200); 
    }

    /**
     * @OA\Post(
     *      path="/logout",
     *      operationId="logoutUser",
     *      tags={"Authentication"},
     *      summary="Logout the authenticated user",
     *      description="Invalidates the current user's API token.",
     *      security={{"apiAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Successfully logged out",
     *          @OA\JsonContent(
     *              @OA\Property(property="status", type="boolean", example=true),
     *              @OA\Property(property="message", type="string", example="Successfully logged out")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated"
     *      )
     * )
     */     
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Successfully logged out'
        ], 200);
    }
}