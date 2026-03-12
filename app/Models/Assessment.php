<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model {
    use HasFactory;

    protected $fillable = ['module_id','lesson_id','title','max_score','min_score','position','scored','worth_points'];

    public function module() {
        return $this->belongsTo(Module::class);
    }

    public function lesson() {
        return $this->belongsTo(Lesson::class);
    }

    public function questions() {
        return $this->hasMany(Question::class);
    }
}