<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ApiController;

Route::prefix('v1')->group(function () {
    Route::post('/login', [ApiController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [ApiController::class, 'user']);
        Route::get('/accounts', [ApiController::class, 'accounts']);
        Route::get('/transactions', [ApiController::class, 'transactions']);
        Route::get('/budgets', [ApiController::class, 'budgets']);
        Route::get('/goals', [ApiController::class, 'goals']);
    });
});
