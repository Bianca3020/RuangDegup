<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MemberBorrowingController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MemberProfileController;
use App\Http\Controllers\MemberDashboardController;
use App\Http\Controllers\FooterQuoteController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/catalog', [BookController::class, 'catalog']);
Route::get('/books/new-arrivals', [BookController::class, 'newArrivals']);
Route::get('/footer-quotes/random', [FooterQuoteController::class, 'random']);
Route::get('/footer-quotes', [FooterQuoteController::class, 'publicQuotes']);

Route::middleware(['auth:sanctum', 'member'])->group(function () {
    Route::get('/member/dashboard', [MemberDashboardController::class, 'index']);

    Route::get('/member/me', [AuthController::class, 'me']);

    Route::get('/member/profile', [MemberProfileController::class, 'show']);
    Route::post('/member/profile', [MemberProfileController::class, 'update']);
    Route::post('/member/profile/password', [MemberProfileController::class, 'updatePassword']);

    Route::delete('/member/profile/photo', [MemberProfileController::class, 'deletePhoto']);
    Route::delete('/member/profile/background', [MemberProfileController::class, 'deleteBackground']);

    Route::get('/member/borrowings', [MemberBorrowingController::class, 'index']);
    Route::post('/member/borrowings', [MemberBorrowingController::class, 'store']);
    Route::match(['get', 'post', 'put', 'patch'], '/member/borrowings/{id}/return', [MemberBorrowingController::class, 'returnBook']);
    Route::delete('/member/borrowings/{id}', [MemberBorrowingController::class, 'destroy']);

    Route::get('/member/favorites', [FavoriteController::class, 'index']);
    Route::post('/member/favorites', [FavoriteController::class, 'store']);
    Route::delete('/member/favorites/{book}', [FavoriteController::class, 'destroy']);

    Route::get('/member/reviews', [ReviewController::class, 'index']);
    Route::post('/member/reviews', [ReviewController::class, 'store']);
    Route::put('/member/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/member/reviews/{review}', [ReviewController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/reports/borrowings', [ReportController::class, 'borrowings']);
    Route::get('/reports/borrowings/pdf', [ReportController::class, 'exportPdf']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('books', BookController::class);
    Route::match(['post', 'put', 'patch'], '/books/{book}', [BookController::class, 'update']);
    Route::apiResource('members', MemberController::class);
    Route::apiResource('borrowings', BorrowingController::class);
    Route::apiResource('footer-quotes', FooterQuoteController::class);
    Route::patch('/footer-quotes/{footerQuote}/toggle', [FooterQuoteController::class, 'toggle']);
});