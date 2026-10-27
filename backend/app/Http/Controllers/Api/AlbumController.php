<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\AlbumSelectionList;
use App\Services\GoogleDriveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AlbumController extends Controller
{
    public function __construct(
        private readonly GoogleDriveService $driveService
    ) {}

    public function index(): JsonResponse
    {
        $albums = Album::with([
            'booking.customer',
            'branch',
            'selectionLists.items.photo',
        ])->orderByDesc('id')->get();

        return response()->json(['albums' => $albums]);
    }

    public function show(int $id): JsonResponse
    {
        $album = Album::with([
            'booking.customer',
            'branch',
            'photos',
            'selectionLists.items.photo',
        ])->findOrFail($id);

        return response()->json(['album' => $album]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => 'nullable|integer',
            'branch_id' => 'nullable|integer',
            'title' => 'required|string|max:190',
            'drive_folder_url' => 'nullable|string|max:190',
            'allow_download' => 'nullable|boolean',
            'watermark_enabled' => 'nullable|boolean',
            'watermark_text' => 'nullable|string|max:100',
            'selection_lists' => 'nullable|array',
            'photo_codes' => 'nullable|array',
        ]);

        $baseSlug = Str::slug($validated['title']) ?: 'album-' . time();
        $slug = $baseSlug;
        if (Album::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . rand(100, 999);
        }

        $album = Album::create([
            'booking_id' => $validated['booking_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? 1,
            'title' => $validated['title'],
            'slug' => $slug,
            'drive_folder_url' => $validated['drive_folder_url'] ?? 'https://drive.google.com/drive/folders/1TenshigazeDriveFolder',
            'allow_download' => $validated['allow_download'] ?? true,
            'watermark_enabled' => $validated['watermark_enabled'] ?? true,
            'watermark_text' => $validated['watermark_text'] ?? 'TENSHIGAZE STUDIO',
            'status' => 'active',
        ]);

        // Create default or custom selection lists (e.g., Nhà trai, Nhà gái, Dâu & rể)
        $lists = !empty($validated['selection_lists'])
            ? $validated['selection_lists']
            : [
                ['name' => 'Nhà trai', 'quota_limit' => 6],
                ['name' => 'Nhà gái', 'quota_limit' => 6],
                ['name' => 'Dâu & rể', 'quota_limit' => 6],
            ];

        foreach ($lists as $listData) {
            AlbumSelectionList::create([
                'album_id' => $album->id,
                'name' => $listData['name'] ?? 'Danh sách mặc định',
                'quota_limit' => (int) ($listData['quota_limit'] ?? 10),
                'selected_count' => 0,
                'status' => 'selecting',
            ]);
        }

        $this->driveService->syncFolderToAlbum($album, $validated['photo_codes'] ?? []);

        return $this->show($album->id);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $album = Album::findOrFail($id);
        $album->update($request->only([
            'title',
            'booking_id',
            'drive_folder_url',
            'allow_download',
            'watermark_enabled',
            'watermark_text',
            'status',
        ]));

        return $this->show($album->id);
    }

    public function destroy(int $id): JsonResponse
    {
        Album::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa album.']);
    }

    public function syncDrive(Request $request, int $id): JsonResponse
    {
        $album = Album::findOrFail($id);
        if ($request->filled('drive_folder_url')) {
            $album->update(['drive_folder_url' => $request->drive_folder_url]);
        }

        $customCodes = [];
        if ($request->filled('photo_codes_raw')) {
            $customCodes = preg_split('/[\s,;]+/', trim((string) $request->photo_codes_raw), -1, PREG_SPLIT_NO_EMPTY);
        } elseif (is_array($request->photo_codes)) {
            $customCodes = $request->photo_codes;
        }

        $syncResult = $this->driveService->syncFolderToAlbum($album, $customCodes);

        return response()->json([
            'sync' => $syncResult,
            'album' => Album::with(['booking.customer', 'photos', 'selectionLists.items.photo'])->find($album->id),
        ]);
    }

    public function storeSelectionList(Request $request, int $id): JsonResponse
    {
        $album = Album::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'quota_limit' => 'nullable|integer|min:1',
        ]);

        AlbumSelectionList::create([
            'album_id' => $album->id,
            'name' => $validated['name'],
            'quota_limit' => (int) ($validated['quota_limit'] ?? 10),
            'selected_count' => 0,
            'status' => 'selecting',
        ]);

        return $this->show($album->id);
    }

    public function deleteSelectionList(int $id, int $listId): JsonResponse
    {
        $album = Album::findOrFail($id);
        AlbumSelectionList::where('album_id', $album->id)->where('id', $listId)->delete();
        return $this->show($album->id);
    }
}
