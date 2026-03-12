<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model {
    use HasFactory;

    protected $table = 'modules';
    protected $fillable = ['course_id','title','description','position','content'];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function lessons() {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }

    public function assessments() {
        return $this->hasMany(Assessment::class)->orderBy('position');
    }
}