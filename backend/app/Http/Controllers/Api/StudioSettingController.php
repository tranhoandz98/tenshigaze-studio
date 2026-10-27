<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudioSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudioSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = StudioSetting::pluck('value', 'key')->toArray();
        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->input('settings', $request->all());
        if (is_array($payload)) {
            foreach ($payload as $key => $value) {
                if (is_string($key)) {
                    StudioSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => is_scalar($value) ? (string) $value : json_encode($value)]
                    );
                }
            }
        }

        return $this->index();
    }
}
