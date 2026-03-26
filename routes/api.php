<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LessonController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameAdminController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MediaCategoryController;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post('check-email', [AuthController::class, 'checkEmail']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    // Refresh must be outside auth:api middleware — needs to accept expired tokens
    Route::post('refresh', [AuthController::class, 'refresh']);

    // Google OAuth — usa middleware web para sessão (state, frontend_url)
    Route::get('google', [AuthController::class, 'redirectToGoogle'])
        ->middleware('web');
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback'])
        ->middleware('web');

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('me', [AuthController::class, 'updateProfile']);
        Route::post('avatar', [AuthController::class, 'uploadAvatar']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});



/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:api', 'role:gerente'])->group(function () {
    Route::apiResource('users', UserController::class);

    Route::post('media-categories', [MediaCategoryController::class, 'store']);
    Route::delete('media-categories/{mediaCategory}', [MediaCategoryController::class, 'destroy']);

    Route::get('games/admin', [GameAdminController::class, 'index']);
    Route::post('games', [GameAdminController::class, 'store']);
    Route::put('games/{game}', [GameAdminController::class, 'update']);
    Route::delete('games/{game}', [GameAdminController::class, 'destroy']);
});

Route::middleware('auth:api')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | COURSES
    |--------------------------------------------------------------------------
    */
    Route::apiResource('courses', CourseController::class);

    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */
    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

    Route::post('courses/{course}/feature', [CourseController::class, 'toggleFeature']);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::post('courses/{course}/lessons/{lesson}/complete', [CourseController::class, 'completeLesson']);
    Route::post('courses/{course}/assessments/{assessment}/complete', [CourseController::class, 'completeAssessment']);

    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::apiResource('badges', BadgeController::class);

    Route::get('push-subscriptions/vapid-public-key', [PushSubscriptionController::class, 'vapidPublicKey']);
    Route::get('push-subscriptions/debug', [PushSubscriptionController::class, 'index']);
    Route::post('push-subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('push-subscriptions', [PushSubscriptionController::class, 'destroy']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications', [NotificationController::class, 'deleteAll']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/report-left-incomplete', [NotificationController::class, 'reportLeftIncomplete']);
    Route::post('notifications/broadcast', [NotificationController::class, 'broadcast']);

    Route::get('games', [GameController::class, 'index']);
    Route::get('games/{game}', [GameController::class, 'show']);
    Route::post('games/{game}/complete', [GameController::class, 'complete']);

    Route::get('media', [MediaController::class, 'index']);
    Route::post('media', [MediaController::class, 'store']);
    Route::patch('media/{media}', [MediaController::class, 'update']);
    Route::delete('media/{media}', [MediaController::class, 'destroy']);

    Route::get('media-categories', [MediaCategoryController::class, 'index']);

    Route::get('performance/overview', [PerformanceController::class, 'overview']);
    Route::get('performance/course/{course}', [PerformanceController::class, 'courseStats']);
    Route::get('performance/me', [PerformanceController::class, 'myPerformance']);
    Route::get('performance/user/{user}', [PerformanceController::class, 'userPerformance']);


    /*
    |--------------------------------------------------------------------------
    | MODULES
    |--------------------------------------------------------------------------
    */
    Route::apiResource('modules', ModuleController::class);


    /*
    |--------------------------------------------------------------------------
    | LESSONS
    |--------------------------------------------------------------------------
    */
    Route::apiResource('lessons', LessonController::class);


    /*
    |--------------------------------------------------------------------------
    | ASSESSMENTS
    |--------------------------------------------------------------------------
    */
    Route::apiResource('assessments', AssessmentController::class);


    /*
    |--------------------------------------------------------------------------
    | QUESTIONS
    |--------------------------------------------------------------------------
    */
    Route::apiResource('questions', QuestionController::class);


    /*
    |--------------------------------------------------------------------------
    | OPTIONS
    |--------------------------------------------------------------------------
    */
    Route::apiResource('options', OptionController::class);
});