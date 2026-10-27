<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollPeriod extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'total_amount' => 'float',
        'paid_amount' => 'float',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function recalculateTotals(): void
    {
        $total = (float) $this->items()->sum('net_total');
        $paid = (float) $this->items()->where('status', 'paid')->sum('net_total');
        $this->update([
            'total_amount' => $total,
            'paid_amount' => $paid,
            'status' => ($total > 0 && $paid >= $total) ? 'closed' : 'approved',
        ]);
    }
}
