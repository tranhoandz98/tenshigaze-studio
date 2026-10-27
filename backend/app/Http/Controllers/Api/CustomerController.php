<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::with(['branch', 'bookings']);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        return response()->json([
            'customers' => $query->orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|integer',
            'name' => 'required|string|max:190',
            'phone' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:190',
            'zalo' => 'nullable|string|max:64',
            'address' => 'nullable|string|max:190',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::create(array_merge(['branch_id' => 1], $validated));
        return response()->json(['customer' => $customer], 201);
    }

    public function show(int $id): JsonResponse
    {
        $customer = Customer::with(['branch', 'bookings.items', 'bookings.payments'])->findOrFail($id);
        return response()->json(['customer' => $customer]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->only(['branch_id', 'name', 'phone', 'email', 'zalo', 'address', 'notes']));
        return response()->json(['customer' => $customer]);
    }

    public function destroy(int $id): JsonResponse
    {
        Customer::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa khách hàng.']);
    }
}
