<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterQuote extends Model
{
    protected $fillable = [
        'quote',
        'author',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
