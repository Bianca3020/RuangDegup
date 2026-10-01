<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MemberBorrowingController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/catalog', [BookController::class, 'catalog']);

Route::middleware(['auth:sanctum', 'member'])->group(function () {
    Route::get('/member/me', [AuthController::class, 'me']);

    Route::get('/member/profile', [MemberProfileController::class, 'show']);
    Route::post('/member/profile', [MemberProfileController::class, 'update']);

    Route::get('/member/borrowings', [MemberBorrowingController::class, 'index']);
    Route::post('/member/borrowings', [MemberBorrowingController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/reports/borrowings', [ReportController::class, 'borrowings']);
    Route::get('/reports/borrowings/pdf', [ReportController::class, 'exportPdf']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('books', BookController::class);
    Route::apiResource('members', MemberController::class);
    Route::apiResource('borrowings', BorrowingController::class);
});