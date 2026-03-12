<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model {
    use HasFactory;

    protected $fillable = ['assessment_id','text','answer_text','is_multiple_choice','score'];

    public function assessment() {
    return $this->belongsTo(Assessment::class);
    }

    public function options() {
        return $this->hasMany(Option::class);
    }
}