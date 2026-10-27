<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Album extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'allow_download' => 'boolean',
        'watermark_enabled' => 'boolean',
        'photo_count' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AlbumPhoto::class)->orderBy('photo_code');
    }

    public function selectionLists(): HasMany
    {
        return $this->hasMany(AlbumSelectionList::class);
    }
}
