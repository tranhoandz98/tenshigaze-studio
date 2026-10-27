<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlbumSelectionItem extends Model
{
    protected $guarded = ['id'];

    public function selectionList(): BelongsTo
    {
        return $this->belongsTo(AlbumSelectionList::class, 'selection_list_id');
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(AlbumPhoto::class, 'album_photo_id');
    }
}
