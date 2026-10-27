<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $guarded = ['id'];

    public const STATUS_STEPS = [
        'pending_confirmation' => ['step' => 1, 'label' => 'Chờ xác nhận'],
        'confirmed'            => ['step' => 2, 'label' => 'Đã xác nhận'],
        'shooting'             => ['step' => 3, 'label' => 'Đang chụp'],
        'selecting_photos'     => ['step' => 4, 'label' => 'Đang chọn ảnh'],
        'photos_selected'      => ['step' => 5, 'label' => 'Chọn ảnh xong'],
        'retouching'           => ['step' => 6, 'label' => 'Đang retouch'],
        'retouched'            => ['step' => 7, 'label' => 'Đã retouch'],
        'completed'            => ['step' => 8, 'label' => 'Hoàn thành'],
    ];

    protected $casts = [
        'total_amount' => 'float',
        'deposit_amount' => 'float',
        'paid_amount' => 'float',
        'remaining_amount' => 'float',
        'google_calendar_synced' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function saleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sale_user_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(BookingSession::class)->orderBy('shoot_date')->orderBy('start_time');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookingPayment::class)->orderByDesc('paid_at');
    }

    public function album(): HasOne
    {
        return $this->hasOne(Album::class);
    }

    public function recalculateFinancials(): void
    {
        $total = (float) $this->items()->sum('total_price');
        $deposit = (float) $this->payments()->where('payment_type', 'deposit')->sum('amount');
        $paid = (float) $this->payments()->sum('amount');

        $this->update([
            'total_amount' => $total,
            'deposit_amount' => $deposit,
            'paid_amount' => $paid,
            'remaining_amount' => max(0, $total - $paid),
        ]);
    }
}
