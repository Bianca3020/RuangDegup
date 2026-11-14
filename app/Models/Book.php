<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    protected $fillable = [
        'category_id',
        'judul',
        'penulis',
        'penerbit',
        'tahun_terbit',
        'isbn',
        'deskripsi',
        'stok',
        'cover',
    ];

    protected function cover(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                    return $value;
                }
                return app()->runningInConsole()
                    ? Storage::disk('public')->url($value)
                    : asset('storage/' . $value);
            }
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}