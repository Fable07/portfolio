<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\HobbyController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MessageController;

/*
|--------------------------------------------------------------------------
| Public routes — read-only data for the portfolio site
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::post('/visitors/increment', [VisitorController::class, 'increment'])->middleware('throttle:30,1');
Route::get('/visitors/count', [VisitorController::class, 'count']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show'])->whereNumber('id');
Route::get('/certifications', [CertificationController::class, 'index']);
Route::get('/resume', [ResumeController::class, 'show']);
Route::get('/hobbies', [HobbyController::class, 'index']);
Route::get('/timeline', [TimelineController::class, 'index']);
Route::get('/profile', [ProfileController::class, 'show']);

// Contact form — 5 messages per hour per IP
Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:5,60');

/*
|--------------------------------------------------------------------------
| Protected routes — admin panel only (Sanctum bearer token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth session
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Contact inbox
    Route::get('/messages', [MessageController::class, 'index']);
    Route::put('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

    // Profile (single record)
    Route::put('/profile', [ProfileController::class, 'update']);

    // Media uploads (files go to the media driver; content stores the returned JSON)
    Route::post('/media', [MediaController::class, 'store'])->middleware('throttle:60,1');
    Route::post('/media/embed', [MediaController::class, 'embed']);
    Route::delete('/media', [MediaController::class, 'destroy']);

    // Projects
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/reorder', [ProjectController::class, 'reorder']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Certifications
    Route::post('/certifications', [CertificationController::class, 'store']);
    Route::put('/certifications/reorder', [CertificationController::class, 'reorder']);
    Route::put('/certifications/{id}', [CertificationController::class, 'update']);
    Route::delete('/certifications/{id}', [CertificationController::class, 'destroy']);

    // Resume
    Route::put('/resume', [ResumeController::class, 'update']);

    // Hobbies
    Route::post('/hobbies', [HobbyController::class, 'store']);
    Route::put('/hobbies/reorder', [HobbyController::class, 'reorder']);
    Route::put('/hobbies/{id}', [HobbyController::class, 'update']);
    Route::delete('/hobbies/{id}', [HobbyController::class, 'destroy']);

    // Timeline
    Route::post('/timeline', [TimelineController::class, 'store']);
    Route::put('/timeline/reorder', [TimelineController::class, 'reorder']);
    Route::put('/timeline/{id}', [TimelineController::class, 'update']);
    Route::delete('/timeline/{id}', [TimelineController::class, 'destroy']);
});
