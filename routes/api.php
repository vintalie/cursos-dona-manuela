<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LessonController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
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
});

Route::middleware('auth:api')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | COURSES
    |--------------------------------------------------------------------------
    */
    Route::apiResource('courses', CourseController::class);

    Route::post('courses/{course}/feature', [CourseController::class, 'toggleFeature']); // opcional


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