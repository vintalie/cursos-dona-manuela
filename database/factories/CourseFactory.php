<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'difficulty' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'featured' => $this->faker->boolean(),
        ];
    }
}
