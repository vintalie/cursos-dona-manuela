<?php

namespace App\Models;

use App\Models\Badge;
use App\Models\Course;
use App\Models\Notification;
use App\Models\Lesson;
use App\Models\Assessment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, HasPushSubscriptions, Notifiable;
    
    protected $fillable = [
        'name',
        'email',
        'tipo',
        'password',
        'full_name',
        'avatar',
        'gender',
        'address',
        'whatsapp',
        'phone',
    ];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed'
        
    ];
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_user')->withTimestamps()->withPivot(['progress', 'completed_at']);
    }

    public function completedLessons()
    {
        return $this->belongsToMany(Lesson::class, 'lesson_user')->withTimestamps()->withPivot('completed_at');
    }

    public function completedAssessments()
    {
        return $this->belongsToMany(Assessment::class, 'assessment_user')->withTimestamps()->withPivot(['score', 'completed_at']);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
            ->withPivot(['course_id', 'module_id', 'earned_at'])
            ->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    public function gameSessions()
    {
        return $this->hasMany(GameSession::class);
    }

    public function gameProgress()
    {
        return $this->hasMany(GameProgress::class);
    }
}