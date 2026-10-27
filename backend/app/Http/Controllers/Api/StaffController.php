<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingAssignment;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function branches(): JsonResponse
    {
        return response()->json([
            'branches' => Branch::withCount(['users', 'bookings'])->get(),
        ]);
    }

    public function storeBranch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:190',
            'code' => 'required|string|max:32|unique:branches,code',
            'address' => 'nullable|string|max:190',
            'phone' => 'nullable|string|max:32',
        ]);

        $branch = Branch::create($validated);
        return response()->json(['branch' => $branch], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::with(['branch', 'assignments.session.booking']);
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return response()->json([
            'staff' => $query->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'name' => 'required|string|max:190',
            'email' => 'required|email|max:190|unique:users,email',
            'phone' => 'nullable|string|max:32',
            'role' => 'required|in:owner,manager,photographer,makeup,sale,retoucher',
            'is_freelancer' => 'nullable|boolean',
            'avatar_color' => 'nullable|string|max:32',
            'base_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0',
            'default_task_rate' => 'nullable|numeric|min:0',
            'google_calendar_email' => 'nullable|string|max:190',
        ]);

        $user = User::create(array_merge($validated, [
            'branch_id' => $validated['branch_id'] ?? 1,
            'avatar_color' => $validated['avatar_color'] ?? '#2563eb',
            'google_calendar_connected' => !empty($validated['google_calendar_email']),
            'password' => Hash::make('123456'),
        ]));

        return response()->json(['user' => $user->load('branch')], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update($request->only([
            'branch_id',
            'name',
            'email',
            'phone',
            'role',
            'is_freelancer',
            'avatar_color',
            'base_salary',
            'commission_rate',
            'default_task_rate',
            'google_calendar_email',
            'google_calendar_connected',
            'is_active',
        ]));

        return response()->json(['user' => $user->load('branch')]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Đã xóa nhân sự.']);
    }

    public function schedule(int $id): JsonResponse
    {
        $user = User::with('branch')->findOrFail($id);
        $assignments = BookingAssignment::with(['session.booking.customer'])
            ->where('user_id', $user->id)
            ->get()
            ->sortBy(fn ($a) => ($a->session?->shoot_date?->format('Y-m-d') ?? '') . ' ' . ($a->session?->start_time ?? ''))
            ->values();

        return response()->json([
            'user' => $user,
            'assignments' => $assignments,
        ]);
    }
}
