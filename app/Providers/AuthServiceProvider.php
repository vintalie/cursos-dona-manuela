<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

/*
|--------------------------------------------------------------------------
| Models
|--------------------------------------------------------------------------
*/

use App\Models\Badge;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Assessment;
use App\Models\Question;
use App\Models\Category;
use App\Models\Option;
use App\Models\User;
use App\Models\Media;
use App\Models\MediaCategory;

/*
|--------------------------------------------------------------------------
| Policies
|--------------------------------------------------------------------------
*/

use App\Policies\CoursePolicy;
use App\Policies\ModulePolicy;
use App\Policies\LessonPolicy;
use App\Policies\AssessmentPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\OptionPolicy;
use App\Policies\UserPolicy;
use App\Policies\MediaPolicy;
use App\Policies\MediaCategoryPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [

        Badge::class      => BadgePolicy::class,
        Course::class     => CoursePolicy::class,
        Module::class     => ModulePolicy::class,
        Lesson::class     => LessonPolicy::class,
        Assessment::class => AssessmentPolicy::class,
        Question::class   => QuestionPolicy::class,
        Option::class     => OptionPolicy::class,
        Category::class   => CategoryPolicy::class,
        User::class => UserPolicy::class,
        Media::class => MediaPolicy::class,
        MediaCategory::class => MediaCategoryPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        /*
        |--------------------------------------------------------------------------
        | Gate Global (opcional)
        |--------------------------------------------------------------------------
        | Permite que gerente tenha acesso total automaticamente.
        | Se quiser remover superpoder, pode apagar este bloco.
        */
        Gate::before(function ($user, $ability) {
            if ($user->tipo === 'gerente') {
                return true;
            }
        });
    }
}