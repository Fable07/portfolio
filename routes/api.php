<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\HobbyController;
use App\Http\Controllers\TimelineController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Visitor counter routes
Route::post('/visitors/increment', [VisitorController::class, 'increment']);
Route::get('/visitors/count', [VisitorController::class, 'count']);

// Project routes
Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::put('/projects/reorder', [ProjectController::class, 'reorder']);
Route::put('/projects/{id}', [ProjectController::class, 'update']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

// Certification routes
Route::get('/certifications', [CertificationController::class, 'index']);
Route::post('/certifications', [CertificationController::class, 'store']);
Route::put('/certifications/{id}', [CertificationController::class, 'update']);
Route::delete('/certifications/{id}', [CertificationController::class, 'destroy']);

// Resume routes
Route::get('/resume', [ResumeController::class, 'show']);
Route::put('/resume', [ResumeController::class, 'update']);

// Hobby routes
Route::get('/hobbies', [HobbyController::class, 'index']);
Route::post('/hobbies', [HobbyController::class, 'store']);
Route::put('/hobbies/{id}', [HobbyController::class, 'update']);
Route::delete('/hobbies/{id}', [HobbyController::class, 'destroy']);


// Timeline routes
Route::get('/timeline', [TimelineController::class, 'index']);
Route::post('/timeline', [TimelineController::class, 'store']);
Route::put('/timeline/{id}', [TimelineController::class, 'update']);
Route::delete('/timeline/{id}', [TimelineController::class, 'destroy']);
