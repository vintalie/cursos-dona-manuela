<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'title',
        'short_description',
        'long_description',
        'image',
        'icon',
        'notification_message',
        'criteria_type',
        'criteria_params',
    ];

    protected $casts = [
        'criteria_params' => 'array',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'badge_user')
            ->withPivot(['course_id', 'module_id', 'earned_at'])
            ->withTimestamps();
    }
}
