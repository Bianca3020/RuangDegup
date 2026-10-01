<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'nomor_anggota',
        'nama',
        'kelas',
        'alamat',
        'no_hp',
        'bio',
        'profile_photo',
        'profile_background',
        'tanggal_daftar',
    ];

    protected $casts = [
        'tanggal_daftar' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }
}