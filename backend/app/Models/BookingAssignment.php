<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingAssignment extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'task_fee' => 'float',
        'calendar_synced' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(BookingSession::class, 'booking_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
