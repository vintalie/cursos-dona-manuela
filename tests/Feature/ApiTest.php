<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Assessment;
use App\Models\Question;
use App\Models\Option;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class ApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Criar usuário de teste com tipo 'gerente'
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'tipo' => 'gerente',
        ]);
    }

    protected function authenticate()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->token = $response['access_token'];
        return $this->withHeader('Authorization', 'Bearer ' . $this->token);
    }

    // ==================== AUTHENTICATION TESTS ====================

    /**
     * Test user registration
     */
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'tipo' => 'aluno',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_in',
            'user' => ['id', 'name', 'email', 'tipo'],
        ]);
    }

    /**
     * Test registration validation
     */
    public function test_registration_fails_with_invalid_data()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'invalid-email',
            'password' => 'short',
            'tipo' => 'invalid',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['email', 'password', 'tipo']);
    }

    /**
     * Test user can login
     */
    public function test_user_can_login()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_in',
            'user' => ['id', 'name', 'email'],
        ]);
    }

    /**
     * Test login fails with incorrect password
     */
    public function test_login_fails_with_incorrect_password()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['error' => 'Password incorrect']);
    }

    /**
     * Test login fails with non-existent user
     */
    public function test_login_fails_with_non_existent_user()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(404);
        $response->assertJson(['error' => 'User not found']);
    }

    /**
     * Test authenticated user can get their info
     */
    public function test_authenticated_user_can_get_their_info()
    {
        $response = $this->authenticate()
            ->getJson('/api/auth/me');

        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'name', 'email']);
        $response->assertJson(['email' => 'test@example.com']);
    }

    /**
     * Test unauthenticated user cannot access protected routes
     */
    public function test_unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(401);
    }

    /**
     * Test user can logout
     */
    public function test_user_can_logout()
    {
        $response = $this->authenticate()
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Successfully logged out']);
    }

    // ==================== COURSES TESTS ====================

    /**
     * Test can list all courses
     */
    public function test_can_list_all_courses()
    {
        Course::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/courses');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'title', 'description', 'difficulty', 'featured', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create a course
     */
    public function test_can_create_a_course()
    {
        $response = $this->authenticate()
            ->postJson('/api/courses', [
                'title' => 'PHP Basics',
                'description' => 'Learn PHP fundamentals',
                'difficulty' => 'beginner',
                'featured' => true,
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['id', 'title', 'description', 'difficulty', 'featured']);
        $this->assertDatabaseHas('courses', ['title' => 'PHP Basics']);
    }

    /**
     * Test course creation validation
     */
    public function test_course_creation_requires_title()
    {
        $response = $this->authenticate()
            ->postJson('/api/courses', [
                'description' => 'Missing title',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific course
     */
    public function test_can_show_a_specific_course()
    {
        $course = Course::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/courses/' . $course->id);

        $response->assertStatus(200);
        $response->assertJson([
            'id' => $course->id,
            'title' => $course->title,
        ]);
        $response->assertJsonStructure(['modules' => ['*' => ['id', 'title']]]);
    }

    /**
     * Test can update a course
     */
    public function test_can_update_a_course()
    {
        $course = Course::factory()->create(['title' => 'Old Title']);

        $response = $this->authenticate()
            ->putJson('/api/courses/' . $course->id, [
                'title' => 'Updated Title',
                'featured' => true,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['title' => 'Updated Title']);
        $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'Updated Title']);
    }

    /**
     * Test can delete a course
     */
    public function test_can_delete_a_course()
    {
        $course = Course::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/courses/' . $course->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Curso removido com sucesso']);
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    /**
     * Test can toggle course feature
     */
    public function test_can_toggle_course_feature()
    {
        $course = Course::factory()->create(['featured' => false]);

        $response = $this->authenticate()
            ->postJson('/api/courses/' . $course->id . '/feature');

        $response->assertStatus(200);
    }

    // ==================== MODULES TESTS ====================

    /**
     * Test can list all modules
     */
    public function test_can_list_all_modules()
    {
        Module::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/modules');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'course_id', 'title', 'description', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create a module
     */
    public function test_can_create_a_module()
    {
        $course = Course::factory()->create();

        $response = $this->authenticate()
            ->postJson('/api/modules', [
                'course_id' => $course->id,
                'title' => 'Module 1',
                'description' => 'First module',
            ]);

        $response->assertStatus(201);
        $response->assertJson(['course_id' => $course->id, 'title' => 'Module 1']);
        $this->assertDatabaseHas('modules', ['title' => 'Module 1']);
    }

    /**
     * Test module creation requires valid course
     */
    public function test_module_creation_requires_valid_course()
    {
        $response = $this->authenticate()
            ->postJson('/api/modules', [
                'course_id' => 9999,
                'title' => 'Module 1',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific module
     */
    public function test_can_show_a_specific_module()
    {
        $module = Module::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/modules/' . $module->id);

        $response->assertStatus(200);
        $response->assertJson(['id' => $module->id, 'title' => $module->title]);
        $response->assertJsonStructure(['lessons' => ['*' => ['id', 'title']]]);
    }

    /**
     * Test can update a module
     */
    public function test_can_update_a_module()
    {
        $module = Module::factory()->create(['title' => 'Old Title']);

        $response = $this->authenticate()
            ->putJson('/api/modules/' . $module->id, [
                'title' => 'Updated Module',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['title' => 'Updated Module']);
    }

    /**
     * Test can delete a module
     */
    public function test_can_delete_a_module()
    {
        $module = Module::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/modules/' . $module->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Módulo removido com sucesso']);
        $this->assertDatabaseMissing('modules', ['id' => $module->id]);
    }

    // ==================== LESSONS TESTS ====================

    /**
     * Test can list all lessons
     */
    public function test_can_list_all_lessons()
    {
        Lesson::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/lessons');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'module_id', 'title', 'content', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create a lesson
     */
    public function test_can_create_a_lesson()
    {
        $module = Module::factory()->create();

        $response = $this->authenticate()
            ->postJson('/api/lessons', [
                'module_id' => $module->id,
                'title' => 'Lesson 1',
                'content' => 'Lesson content',
            ]);

        $response->assertStatus(201);
        $response->assertJson(['module_id' => $module->id, 'title' => 'Lesson 1']);
    }

    /**
     * Test lesson creation requires valid module
     */
    public function test_lesson_creation_requires_valid_module()
    {
        $response = $this->authenticate()
            ->postJson('/api/lessons', [
                'module_id' => 9999,
                'title' => 'Lesson 1',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific lesson
     */
    public function test_can_show_a_specific_lesson()
    {
        $lesson = Lesson::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/lessons/' . $lesson->id);

        $response->assertStatus(200);
        $response->assertJson(['id' => $lesson->id, 'title' => $lesson->title]);
    }

    /**
     * Test can update a lesson
     */
    public function test_can_update_a_lesson()
    {
        $lesson = Lesson::factory()->create(['title' => 'Old Title']);

        $response = $this->authenticate()
            ->putJson('/api/lessons/' . $lesson->id, [
                'title' => 'Updated Lesson',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['title' => 'Updated Lesson']);
    }

    /**
     * Test can delete a lesson
     */
    public function test_can_delete_a_lesson()
    {
        $lesson = Lesson::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/lessons/' . $lesson->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Aula removida com sucesso']);
        $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
    }

    // ==================== ASSESSMENTS TESTS ====================

    /**
     * Test can list all assessments
     */
    public function test_can_list_all_assessments()
    {
        Assessment::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/assessments');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'module_id', 'title', 'max_score', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create an assessment
     */
    public function test_can_create_an_assessment()
    {
        $module = Module::factory()->create();

        $response = $this->authenticate()
            ->postJson('/api/assessments', [
                'module_id' => $module->id,
                'title' => 'Assessment 1',
                'max_score' => 100,
            ]);

        $response->assertStatus(201);
        $response->assertJson(['module_id' => $module->id, 'title' => 'Assessment 1']);
    }

    /**
     * Test assessment creation requires valid module
     */
    public function test_assessment_creation_requires_valid_module()
    {
        $response = $this->authenticate()
            ->postJson('/api/assessments', [
                'module_id' => 9999,
                'title' => 'Assessment 1',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific assessment
     */
    public function test_can_show_a_specific_assessment()
    {
        $assessment = Assessment::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/assessments/' . $assessment->id);

        $response->assertStatus(200);
        $response->assertJson(['id' => $assessment->id, 'title' => $assessment->title]);
        $response->assertJsonStructure(['questions' => ['*' => ['id', 'text', 'options']]]);
    }

    /**
     * Test can update an assessment
     */
    public function test_can_update_an_assessment()
    {
        $assessment = Assessment::factory()->create(['title' => 'Old Title']);

        $response = $this->authenticate()
            ->putJson('/api/assessments/' . $assessment->id, [
                'title' => 'Updated Assessment',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['title' => 'Updated Assessment']);
    }

    /**
     * Test can delete an assessment
     */
    public function test_can_delete_an_assessment()
    {
        $assessment = Assessment::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/assessments/' . $assessment->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Avaliação removida']);
        $this->assertDatabaseMissing('assessments', ['id' => $assessment->id]);
    }

    // ==================== QUESTIONS TESTS ====================

    /**
     * Test can list all questions
     */
    public function test_can_list_all_questions()
    {
        Question::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/questions');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'assessment_id', 'text', 'score', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create a question
     */
    public function test_can_create_a_question()
    {
        $assessment = Assessment::factory()->create();

        $response = $this->authenticate()
            ->postJson('/api/questions', [
                'assessment_id' => $assessment->id,
                'text' => 'What is 2+2?',
                'score' => 10,
            ]);

        $response->assertStatus(201);
        $response->assertJson(['assessment_id' => $assessment->id, 'text' => 'What is 2+2?']);
    }

    /**
     * Test question creation requires valid assessment
     */
    public function test_question_creation_requires_valid_assessment()
    {
        $response = $this->authenticate()
            ->postJson('/api/questions', [
                'assessment_id' => 9999,
                'text' => 'Question',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific question
     */
    public function test_can_show_a_specific_question()
    {
        $question = Question::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/questions/' . $question->id);

        $response->assertStatus(200);
        $response->assertJson(['id' => $question->id, 'text' => $question->text]);
        $response->assertJsonStructure(['options' => ['*' => ['id', 'text']]]);
    }

    /**
     * Test can update a question
     */
    public function test_can_update_a_question()
    {
        $question = Question::factory()->create(['text' => 'Old Question']);

        $response = $this->authenticate()
            ->putJson('/api/questions/' . $question->id, [
                'text' => 'Updated Question',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['text' => 'Updated Question']);
    }

    /**
     * Test can delete a question
     */
    public function test_can_delete_a_question()
    {
        $question = Question::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/questions/' . $question->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Pergunta removida']);
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }

    // ==================== OPTIONS TESTS ====================

    /**
     * Test can list all options
     */
    public function test_can_list_all_options()
    {
        Option::factory()->count(3)->create();

        $response = $this->authenticate()
            ->getJson('/api/options');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => ['id', 'question_id', 'text', 'is_correct', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test can create an option
     */
    public function test_can_create_an_option()
    {
        $question = Question::factory()->create();

        $response = $this->authenticate()
            ->postJson('/api/options', [
                'question_id' => $question->id,
                'label' => 'A',
                'text' => 'Option A',
                'is_correct' => true,
            ]);

        $response->assertStatus(201);
        $response->assertJson(['question_id' => $question->id, 'text' => 'Option A']);
    }

    /**
     * Test option creation requires valid question
     */
    public function test_option_creation_requires_valid_question()
    {
        $response = $this->authenticate()
            ->postJson('/api/options', [
                'question_id' => 9999,
                'text' => 'Option',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test can show a specific option
     */
    public function test_can_show_a_specific_option()
    {
        $option = Option::factory()->create();

        $response = $this->authenticate()
            ->getJson('/api/options/' . $option->id);

        $response->assertStatus(200);
        $response->assertJson(['id' => $option->id, 'text' => $option->text]);
    }

    /**
     * Test can update an option
     */
    public function test_can_update_an_option()
    {
        $option = Option::factory()->create(['text' => 'Old Text']);

        $response = $this->authenticate()
            ->putJson('/api/options/' . $option->id, [
                'text' => 'Updated Text',
            ]);

        $response->assertStatus(200);
        $response->assertJson(['text' => 'Updated Text']);
    }

    /**
     * Test can delete an option
     */
    public function test_can_delete_an_option()
    {
        $option = Option::factory()->create();

        $response = $this->authenticate()
            ->deleteJson('/api/options/' . $option->id);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Alternativa removida']);
        $this->assertDatabaseMissing('options', ['id' => $option->id]);
    }
}
