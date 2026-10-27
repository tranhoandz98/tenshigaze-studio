<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Models\AlbumSelectionItem;
use App\Models\AlbumSelectionList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAlbumController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $album = Album::with([
            'booking.customer',
            'branch',
            'photos',
            'selectionLists.items.photo',
        ])->where('slug', $slug)->firstOrFail();

        return response()->json(['album' => $album]);
    }

    public function createList(Request $request, string $slug): JsonResponse
    {
        $album = Album::where('slug', $slug)->firstOrFail();
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

        return $this->show($slug);
    }

    public function togglePhoto(Request $request, string $slug, int $listId): JsonResponse
    {
        $album = Album::where('slug', $slug)->firstOrFail();
        $list = AlbumSelectionList::where('album_id', $album->id)->findOrFail($listId);

        $validated = $request->validate([
            'photo_id' => 'required|integer',
            'comment' => 'nullable|string|max:190',
        ]);

        $photo = AlbumPhoto::where('album_id', $album->id)->findOrFail($validated['photo_id']);

        $existing = AlbumSelectionItem::where('selection_list_id', $list->id)
            ->where('album_photo_id', $photo->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $selected = false;
        } else {
            AlbumSelectionItem::create([
                'selection_list_id' => $list->id,
                'album_photo_id' => $photo->id,
                'comment' => $validated['comment'] ?? null,
            ]);
            $selected = true;
        }

        $list->recalculateCount();

        return response()->json([
            'selected' => $selected,
            'list' => $list->fresh(['items.photo']),
            'album' => Album::with(['photos', 'selectionLists.items.photo'])->find($album->id),
        ]);
    }

    public function submitList(Request $request, string $slug, int $listId): JsonResponse
    {
        $album = Album::where('slug', $slug)->firstOrFail();
        $list = AlbumSelectionList::where('album_id', $album->id)->findOrFail($listId);

        $list->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'client_note' => $request->input('client_note', $list->client_note),
        ]);

        // If all selection lists are submitted and booking is in selecting_photos, advance to photos_selected
        if ($album->booking && $album->booking->status === 'selecting_photos') {
            $pendingCount = $album->selectionLists()->where('status', '!=', 'submitted')->count();
            if ($pendingCount === 0) {
                $album->booking->update(['status' => 'photos_selected']);
            }
        }

        return $this->show($slug);
    }
}
