<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'title' => $this->faker->words(3, true),
            'max_score' => $this->faker->numberBetween(50, 100),
        ];
    }
}
