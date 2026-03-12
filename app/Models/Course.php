<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    use HasFactory;

    protected $fillable = ['title', 'description', 'difficulty', 'featured', 'target_role', 'category_id', 'short_description'];

    protected $casts = [
        'featured' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function modules() {
        return $this->hasMany(Module::class);
    }

    public function users() {
        return $this->belongsToMany(User::class, 'course_user')->withTimestamps()->withPivot(['progress','completed_at']);
    }
}
