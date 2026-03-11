<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Assessment;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'assessment_id' => Assessment::factory(),
            'text' => $this->faker->sentence(),
            'score' => $this->faker->numberBetween(1, 10),
        ];
    }
}
