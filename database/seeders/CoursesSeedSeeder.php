<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Option;
use App\Models\Question;
use Illuminate\Database\Seeder;

class CoursesSeedSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            Category::firstOrCreate(['name' => 'Higiene']),
            Category::firstOrCreate(['name' => 'Copa e Cozinha']),
            Category::firstOrCreate(['name' => 'Manipulação de Alimentos']),
        ];

        $coursesData = [
            [
                'title' => 'Higiene na Padaria',
                'short_description' => 'Aprenda as práticas essenciais de higiene para garantir a segurança alimentar na padaria.',
                'description' => '<p>Bem-vindo ao curso de <strong>Higiene na Padaria</strong>! Este curso aborda as normas e boas práticas de higiene indispensáveis para quem trabalha em ambientes de produção de alimentos. Você aprenderá sobre higiene pessoal, limpeza de equipamentos, controle de pragas e muito mais.</p>',
                'difficulty' => 'Iniciante',
                'target_role' => 'Produção',
                'featured' => true,
                'category' => $categories[0],
            ],
            [
                'title' => 'Trabalhando na Copa',
                'short_description' => 'Conheça as rotinas e procedimentos para atuar com eficiência e segurança na área da copa.',
                'description' => '<p>Este curso apresenta as rotinas e procedimentos essenciais para trabalhar na <strong>copa</strong> de padarias e estabelecimentos alimentícios. Você aprenderá sobre organização, higienização, preparo de ingredientes e o fluxo de trabalho adequado.</p>',
                'difficulty' => 'Iniciante',
                'target_role' => 'Copa',
                'featured' => true,
                'category' => $categories[1],
            ],
            [
                'title' => 'Manipulação de Alimentos em Padarias',
                'short_description' => 'Domine as técnicas corretas de manipulação de alimentos para garantir qualidade e segurança.',
                'description' => '<p>O curso de <strong>Manipulação de Alimentos em Padarias</strong> aborda as técnicas e normas para o manuseio correto de ingredientes e produtos. Você aprenderá sobre temperatura, armazenamento, contaminação cruzada e as legislações vigentes.</p>',
                'difficulty' => 'Intermediário',
                'target_role' => 'Produção',
                'featured' => false,
                'category' => $categories[2],
            ],
        ];

        foreach ($coursesData as $index => $courseData) {
            $category = $courseData['category'];
            unset($courseData['category']);

            $course = Course::updateOrCreate(
                ['title' => $courseData['title']],
                array_merge($courseData, ['category_id' => $category->id])
            );

            $modulesData = $this->getModulesData($index);
            foreach ($modulesData as $pos => $modData) {
                $module = Module::updateOrCreate(
                    ['course_id' => $course->id, 'title' => $modData['title']],
                    [
                        'description' => $modData['description'],
                        'position' => $pos,
                        'content' => $modData['content'] ?? null,
                    ]
                );

                foreach ($modData['lessons'] as $lPos => $lessonData) {
                    $lessonTitle = $lessonData['title'] ?? 'Aula ' . ($lPos + 1);
                    Lesson::updateOrCreate(
                        ['module_id' => $module->id, 'title' => $lessonTitle],
                        [
                            'description' => $lessonData['description'] ?? null,
                            'position' => $lPos,
                            'content' => $lessonData['content'],
                        ]
                    );
                }

                $lessons = $module->lessons()->orderBy('position')->get();

                foreach ($modData['assessments'] as $aData) {
                    $lesson = isset($aData['lesson_index'])
                        ? $lessons[$aData['lesson_index']] ?? null
                        : null;

                    $assessment = Assessment::updateOrCreate(
                        [
                            'module_id' => $module->id,
                            'lesson_id' => $lesson?->id,
                            'title' => $aData['title'],
                        ],
                        [
                            'max_score' => $aData['max_score'] ?? null,
                            'worth_points' => $lesson === null,
                        ]
                    );

                    foreach ($aData['questions'] as $qData) {
                        $q = Question::updateOrCreate(
                            [
                                'assessment_id' => $assessment->id,
                                'text' => $qData['text'],
                            ],
                            [
                                'answer_text' => $qData['answer_text'] ?? null,
                                'is_multiple_choice' => !empty($qData['options']),
                                'score' => $qData['score'] ?? 0,
                            ]
                        );

                        foreach ($qData['options'] ?? [] as $opt) {
                            Option::updateOrCreate(
                                [
                                    'question_id' => $q->id,
                                    'label' => $opt['label'],
                                ],
                                [
                                    'text' => $opt['text'],
                                    'is_correct' => $opt['is_correct'],
                                ]
                            );
                        }
                    }
                }
            }
        }
    }

    private function getModulesData(int $courseIndex): array
    {
        $base = [
            [
                'title' => 'Introdução e Conceitos Básicos',
                'description' => '<p>Nesta matéria você terá uma visão geral dos conceitos fundamentais. Serão apresentadas as boas práticas e o que será abordado nas aulas seguintes.</p>',
                'content' => null,
                'lessons' => [
                    [
                        'description' => null,
                        'content' => '<p>Nesta aula introdutória, você conhecerá os principais conceitos e a estrutura do conteúdo que será apresentado ao longo do módulo.</p><p>Fique atento aos detalhes e anote suas dúvidas para as próximas aulas.</p>',
                    ],
                    [
                        'description' => null,
                        'content' => '<p>Nesta segunda aula, aprofundamos os conceitos iniciais e preparamos o terreno para os tópicos mais avançados.</p>',
                    ],
                ],
                'assessments' => [
                    [
                        'title' => 'Avaliação do Módulo',
                        'max_score' => 10,
                        'questions' => [
                            [
                                'text' => 'Qual a importância das boas práticas?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Garantir segurança alimentar', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Apenas estética', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'Economia de tempo', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'Nenhuma', 'is_correct' => false],
                                ],
                                'score' => 5,
                            ],
                            [
                                'text' => 'O que deve ser priorizado no ambiente de trabalho?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Velocidade', 'is_correct' => false],
                                    ['label' => 'B', 'text' => 'Higiene e organização', 'is_correct' => true],
                                    ['label' => 'C', 'text' => 'Economia', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'Aparência', 'is_correct' => false],
                                ],
                                'score' => 5,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Normas e Procedimentos',
                'description' => '<p>Esta matéria aborda as normas vigentes e os procedimentos operacionais. Você aprenderá a aplicar as regras no dia a dia.</p>',
                'content' => null,
                'lessons' => [
                    ['title' => 'Normas e regulamentações', 'description' => null, 'content' => '<p>Aula sobre as normas e regulamentações que regem o setor alimentício.</p>'],
                    ['title' => 'Procedimentos operacionais', 'description' => null, 'content' => '<p>Procedimentos operacionais padronizados e sua implementação.</p>'],
                ],
                'assessments' => [
                    [
                        'title' => 'Avaliação do Módulo',
                        'max_score' => 10,
                        'questions' => [
                            [
                                'text' => 'O que são POPs?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Procedimentos Operacionais Padronizados', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Normas de produção', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'Checklist de limpeza', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'Registro de temperatura', 'is_correct' => false],
                                ],
                                'score' => 10,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Quiz da Aula 1',
                        'lesson_index' => 0,
                        'questions' => [
                            [
                                'text' => 'As normas devem ser seguidas?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Sim, sempre', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Às vezes', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'Não', 'is_correct' => false],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Práticas no Dia a Dia',
                'description' => '<p>Aplicação prática dos conceitos aprendidos. Boas práticas e rotinas de trabalho.</p>',
                'content' => null,
                'lessons' => [
                    ['title' => 'Higienização de mãos e equipamentos', 'description' => null, 'content' => '<p>Aula prática sobre higienização de mãos e equipamentos.</p>'],
                    ['title' => 'Organização e fluxo de trabalho', 'description' => null, 'content' => '<p>Organização do ambiente e fluxo de trabalho.</p>'],
                    ['title' => 'Controle de temperatura e armazenamento', 'description' => null, 'content' => '<p>Controle de temperatura e armazenamento.</p>'],
                    ['title' => 'Prevenção de contaminação cruzada', 'description' => null, 'content' => '<p>Prevenção de contaminação cruzada.</p>'],
                ],
                'assessments' => [
                    [
                        'title' => 'Avaliação Final do Módulo',
                        'max_score' => 10,
                        'questions' => [
                            [
                                'text' => 'Como deve ser feita a higienização das mãos?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Com água e sabão por 20 segundos', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Apenas com água', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'Com álcool apenas', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'Não é necessário', 'is_correct' => false],
                                ],
                                'score' => 5,
                            ],
                            [
                                'text' => 'O que é contaminação cruzada?',
                                'answer_text' => 'Transferência de microrganismos de um alimento ou superfície para outro, podendo causar doenças.',
                                'score' => 5,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Quiz Rápido - Aula 1',
                        'lesson_index' => 0,
                        'questions' => [
                            [
                                'text' => 'A higienização das mãos é importante?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Sim', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Não', 'is_correct' => false],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'Quiz Rápido - Aula 2',
                        'lesson_index' => 1,
                        'questions' => [
                            [
                                'text' => 'A organização do ambiente facilita o trabalho?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Sim', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Não', 'is_correct' => false],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Revisão e Conclusão',
                'description' => '<p>Revisão dos conteúdos e conclusão do curso. Certificação e próximos passos.</p>',
                'content' => null,
                'lessons' => [
                    ['title' => 'Revisão geral', 'description' => null, 'content' => '<p>Revisão geral dos conceitos e práticas abordadas.</p>'],
                    ['title' => 'Conclusão', 'description' => null, 'content' => '<p>Conclusão e orientações para continuidade do aprendizado.</p>'],
                ],
                'assessments' => [
                    [
                        'title' => 'Avaliação Final',
                        'max_score' => 10,
                        'questions' => [
                            [
                                'text' => 'Você concluiu o curso com sucesso?',
                                'options' => [
                                    ['label' => 'A', 'text' => 'Sim', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'Não', 'is_correct' => false],
                                ],
                                'score' => 10,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $titles = [
            ['Higiene na Padaria' => ['Higiene Pessoal', 'Limpeza e Sanitização', 'Controle de Pragas', 'Legislação e Documentação']],
            ['Trabalhando na Copa' => ['Organização da Copa', 'Equipamentos e Utensílios', 'Fluxo de Trabalho', 'Segurança na Copa']],
            ['Manipulação de Alimentos em Padarias' => ['Temperatura e Armazenamento', 'Contaminação Cruzada', 'Rotulagem e Validade', 'Boas Práticas de Fabricação']],
        ];

        $descriptions = [
            '<p>Nesta matéria você aprenderá sobre <strong>higiene pessoal</strong>, incluindo uso de uniformes, lavagem de mãos e hábitos que previnem contaminação. Serão apresentadas as boas práticas e o que será abordado nas aulas.</p>',
            '<p>Esta matéria aborda <strong>limpeza e sanitização</strong> de equipamentos e superfícies. Você verá os produtos adequados, diluições e procedimentos corretos.</p>',
            '<p>Conteúdo sobre <strong>controle de pragas</strong>, identificação de sinais e medidas preventivas no ambiente da padaria.</p>',
            '<p>Normas e documentação necessária para o cumprimento da legislação sanitária.</p>',
        ];

        $lessonContents = [
            '<p>Lave as mãos antes de manipular alimentos, após usar o banheiro, tossir ou espirrar. Use sabão e água por pelo menos 20 segundos.</p>',
            '<p>Mantenha unhas curtas e limpas. Evite anéis, relógios e outros acessórios durante o trabalho.</p>',
            '<p>Use uniforme limpo diariamente. O cabelo deve estar preso e coberto por touca ou rede.</p>',
            '<p>Não manipule alimentos se estiver doente. Resfriados, gripes e problemas gastrointestinais podem contaminar os alimentos.</p>',
            '<p>Limpe as superfícies antes de sanitizar. A sujeira reduz a eficácia do sanitizante.</p>',
            '<p>Use os produtos na diluição recomendada pelo fabricante. Respeite o tempo de contato.</p>',
            '<p>Identifique e elimine pontos de entrada de pragas. Mantenha o ambiente fechado e limpo.</p>',
            '<p>Mantenha os registros atualizados: temperatura, limpeza, treinamentos.</p>',
        ];

        $result = [];
        for ($i = 0; $i < 4; $i++) {
            $titlesForCourse = $titles[$courseIndex][array_key_first($titles[$courseIndex])];
            $mod = $base[$i];
            $mod['title'] = $titlesForCourse[$i];
            $mod['description'] = $descriptions[$i] ?? $mod['description'];

            $lessonCount = $i < 2 ? 2 : 4;
            $lessonTitles = [
                ['Introdução', 'Conceitos básicos'],
                ['Normas vigentes', 'Procedimentos'],
                ['Higienização prática', 'Organização', 'Temperatura', 'Contaminação'],
                ['Revisão', 'Conclusão'],
            ];
            $mod['lessons'] = [];
            for ($j = 0; $j < $lessonCount; $j++) {
                $mod['lessons'][] = [
                    'title' => $lessonTitles[$i][$j] ?? 'Aula ' . ($j + 1),
                    'description' => null,
                    'content' => $lessonContents[($i * 2 + $j) % count($lessonContents)],
                ];
            }

            $assessments = $mod['assessments'];
            $mod['assessments'] = [
                $assessments[0],
                ['title' => 'Quiz Aula 1', 'lesson_index' => 0, 'questions' => $assessments[1]['questions'] ?? $assessments[0]['questions']],
            ];
            if ($lessonCount >= 4) {
                $mod['assessments'][] = ['title' => 'Quiz Aula 2', 'lesson_index' => 1, 'questions' => $assessments[1]['questions'] ?? $assessments[0]['questions']];
            }

            $result[] = $mod;
        }

        return $result;
    }
}
