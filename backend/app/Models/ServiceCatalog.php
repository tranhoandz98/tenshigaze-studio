<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'default_price' => 'float',
        'default_duration_minutes' => 'integer',
        'default_photo_rate' => 'float',
        'default_makeup_rate' => 'float',
        'is_active' => 'boolean',
    ];
}
