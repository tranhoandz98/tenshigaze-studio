<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('branch')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng.'], 401);
        }

        if (!$user->api_token) {
            $user->update(['api_token' => 'tg_' . Str::random(40)]);
        }

        return response()->json([
            'token' => $user->api_token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $bearer = $request->bearerToken();
        $user = $bearer
            ? User::with('branch')->where('api_token', $bearer)->first()
            : null;

        if (!$user) {
            $user = User::with('branch')->where('role', 'owner')->first()
                ?? User::with('branch')->first();
        }

        return response()->json(['user' => $user]);
    }
}
