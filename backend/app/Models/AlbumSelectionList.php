<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlbumSelectionList extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'quota_limit' => 'integer',
        'selected_count' => 'integer',
        'submitted_at' => 'datetime',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AlbumSelectionItem::class, 'selection_list_id');
    }

    public function recalculateCount(): void
    {
        $this->update([
            'selected_count' => $this->items()->count(),
        ]);
    }
}
