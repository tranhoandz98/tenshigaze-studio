<?php

use App\Http\Controllers\Api\AlbumController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PublicAlbumController;
use App\Http\Controllers\Api\ServiceCatalogController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StudioSettingController;
use Illuminate\Support\Facades\Route;

// Public client photo selection endpoints (no login required)
Route::prefix('public/albums')->group(function () {
    Route::get('/{slug}', [PublicAlbumController::class, 'show']);
    Route::post('/{slug}/lists', [PublicAlbumController::class, 'createList']);
    Route::post('/{slug}/lists/{listId}/toggle-photo', [PublicAlbumController::class, 'togglePhoto']);
    Route::post('/{slug}/lists/{listId}/submit', [PublicAlbumController::class, 'submitList']);
});

// Auth endpoints
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me']);

// Studio management endpoints
Route::get('/dashboard', [DashboardController::class, 'index']);

// Bookings, sessions, items, payments, crew assignments & conflict checks
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/bookings/check-conflicts', [BookingController::class, 'checkConflicts']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

Route::post('/bookings/{id}/items', [BookingController::class, 'addItem']);
Route::delete('/bookings/{id}/items/{itemId}', [BookingController::class, 'removeItem']);

Route::post('/bookings/{id}/payments', [BookingController::class, 'addPayment']);
Route::delete('/bookings/{id}/payments/{paymentId}', [BookingController::class, 'removePayment']);

Route::post('/bookings/{id}/sessions', [BookingController::class, 'addSession']);
Route::put('/bookings/{id}/sessions/{sessionId}', [BookingController::class, 'updateSession']);
Route::post('/bookings/{id}/sessions/{sessionId}/assignments', [BookingController::class, 'assignCrew']);
Route::delete('/bookings/{id}/sessions/{sessionId}/assignments/{assignmentId}', [BookingController::class, 'removeAssignment']);

// Customers & Service Catalogs
Route::apiResource('customers', CustomerController::class);
Route::apiResource('services', ServiceCatalogController::class);

// Staff & Branches
Route::get('/branches', [StaffController::class, 'branches']);
Route::post('/branches', [StaffController::class, 'storeBranch']);
Route::get('/staff', [StaffController::class, 'index']);
Route::post('/staff', [StaffController::class, 'store']);
Route::put('/staff/{id}', [StaffController::class, 'update']);
Route::delete('/staff/{id}', [StaffController::class, 'destroy']);
Route::get('/staff/{id}/schedule', [StaffController::class, 'schedule']);

// Albums & Google Drive Sync
Route::get('/albums', [AlbumController::class, 'index']);
Route::post('/albums', [AlbumController::class, 'store']);
Route::get('/albums/{id}', [AlbumController::class, 'show']);
Route::put('/albums/{id}', [AlbumController::class, 'update']);
Route::delete('/albums/{id}', [AlbumController::class, 'destroy']);
Route::post('/albums/{id}/sync-drive', [AlbumController::class, 'syncDrive']);
Route::post('/albums/{id}/lists', [AlbumController::class, 'storeSelectionList']);
Route::delete('/albums/{id}/lists/{listId}', [AlbumController::class, 'deleteSelectionList']);

// Payroll (Lương khoán, Lương cứng, Hoa hồng, Chốt kỳ & Chi trả)
Route::get('/payroll', [PayrollController::class, 'index']);
Route::post('/payroll/generate', [PayrollController::class, 'generate']);
Route::patch('/payroll/items/{itemId}', [PayrollController::class, 'updateItem']);
Route::post('/payroll/items/{itemId}/pay', [PayrollController::class, 'payItem']);

// Finance & 7 Report Exports (CSV / Excel / Google Sheets format)
Route::get('/finance', [FinanceController::class, 'index']);
Route::post('/finance/transactions', [FinanceController::class, 'storeTransaction']);
Route::delete('/finance/transactions/{id}', [FinanceController::class, 'destroyTransaction']);
Route::get('/reports/export/{type}', [FinanceController::class, 'exportReport']);

// Studio Settings & Google Drive / Calendar integration config
Route::get('/settings', [StudioSettingController::class, 'index']);
Route::put('/settings', [StudioSettingController::class, 'update']);
