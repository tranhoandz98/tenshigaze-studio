<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'services' => ServiceCatalog::orderBy('type')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:190',
            'type' => 'required|in:package,surcharge',
            'default_price' => 'required|numeric|min:0',
            'default_duration_minutes' => 'nullable|integer|min:0',
            'default_photo_rate' => 'nullable|numeric|min:0',
            'default_makeup_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $service = ServiceCatalog::create($validated);
        return response()->json(['service' => $service], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['service' => ServiceCatalog::findOrFail($id)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = ServiceCatalog::findOrFail($id);
        $service->update($request->all());
        return response()->json(['service' => $service]);
    }

    public function destroy(int $id): JsonResponse
    {
        ServiceCatalog::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa dịch vụ.']);
    }
}
