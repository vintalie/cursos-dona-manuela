<?php

namespace Database\Factories;

use App\Models\Option;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

class OptionFactory extends Factory
{
    protected $model = Option::class;

    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'label' => $this->faker->randomElement(['A', 'B', 'C', 'D']),
            'text' => $this->faker->words(3, true),
            'is_correct' => $this->faker->boolean(),
        ];
    }
}
