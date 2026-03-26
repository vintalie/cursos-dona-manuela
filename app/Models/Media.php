<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'media_category_id',
        'filename',
        'original_name',
        'path',
        'url',
        'mime_type',
        'type',
        'size',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mediaCategory()
    {
        return $this->belongsTo(MediaCategory::class);
    }
}
