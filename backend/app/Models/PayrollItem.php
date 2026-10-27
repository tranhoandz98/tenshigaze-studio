<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollItem extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'base_salary' => 'float',
        'task_wage_total' => 'float',
        'commission_total' => 'float',
        'bonus_adjustment' => 'float',
        'net_total' => 'float',
        'task_breakdown' => 'array',
        'paid_at' => 'datetime',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
