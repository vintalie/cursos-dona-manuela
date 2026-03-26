<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GamesSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            // ── MEMORY (2) ──────────────────────────────────────────
            [
                'slug'        => 'memory-ingredientes',
                'title'       => 'Memória: Ingredientes',
                'description' => 'Encontre os pares de ingredientes da padaria.',
                'type'        => 'memory',
                'config'      => [
                    'pairs' => [
                        ['id' => 1, 'label' => 'Farinha',   'emoji' => '🌾'],
                        ['id' => 2, 'label' => 'Fermento',  'emoji' => '🧪'],
                        ['id' => 3, 'label' => 'Açúcar',    'emoji' => '🍬'],
                        ['id' => 4, 'label' => 'Ovo',       'emoji' => '🥚'],
                        ['id' => 5, 'label' => 'Leite',     'emoji' => '🥛'],
                        ['id' => 6, 'label' => 'Manteiga',  'emoji' => '🧈'],
                    ],
                ],
                'order' => 1,
            ],
            [
                'slug'        => 'memory-utensilios',
                'title'       => 'Memória: Utensílios',
                'description' => 'Encontre os pares de utensílios usados na panificação.',
                'type'        => 'memory',
                'config'      => [
                    'pairs' => [
                        ['id' => 1, 'label' => 'Rolo',      'emoji' => '🪵'],
                        ['id' => 2, 'label' => 'Forno',     'emoji' => '🔥'],
                        ['id' => 3, 'label' => 'Balança',   'emoji' => '⚖️'],
                        ['id' => 4, 'label' => 'Batedeira', 'emoji' => '🔄'],
                        ['id' => 5, 'label' => 'Espátula',  'emoji' => '🥄'],
                        ['id' => 6, 'label' => 'Forma',     'emoji' => '🍞'],
                    ],
                ],
                'order' => 2,
            ],

            // ── ORDERING (2) ────────────────────────────────────────
            [
                'slug'        => 'ordering-pao-frances',
                'title'       => 'Monte a Receita: Pão Francês',
                'description' => 'Ordene as etapas para produzir pão francês.',
                'type'        => 'ordering',
                'config'      => [
                    'items' => [
                        ['id' => 1, 'text' => 'Pesar os ingredientes'],
                        ['id' => 2, 'text' => 'Misturar farinha, sal e fermento'],
                        ['id' => 3, 'text' => 'Adicionar água e sovar a massa'],
                        ['id' => 4, 'text' => 'Deixar a massa descansar (1ª fermentação)'],
                        ['id' => 5, 'text' => 'Dividir e modelar os pães'],
                        ['id' => 6, 'text' => 'Deixar crescer (2ª fermentação)'],
                        ['id' => 7, 'text' => 'Cortar a pestana e assar'],
                    ],
                ],
                'order' => 3,
            ],
            [
                'slug'        => 'ordering-bolo-simples',
                'title'       => 'Monte a Receita: Bolo Simples',
                'description' => 'Ordene as etapas para fazer um bolo simples.',
                'type'        => 'ordering',
                'config'      => [
                    'items' => [
                        ['id' => 1, 'text' => 'Pré-aquecer o forno a 180°C'],
                        ['id' => 2, 'text' => 'Bater ovos com açúcar até espumar'],
                        ['id' => 3, 'text' => 'Adicionar óleo e leite'],
                        ['id' => 4, 'text' => 'Peneirar e incorporar a farinha com fermento'],
                        ['id' => 5, 'text' => 'Despejar na forma untada'],
                        ['id' => 6, 'text' => 'Assar por 35-40 minutos'],
                        ['id' => 7, 'text' => 'Fazer o teste do palito e desenformar'],
                    ],
                ],
                'order' => 4,
            ],

            // ── VISUAL QUIZ (2) ─────────────────────────────────────
            [
                'slug'        => 'vquiz-paes',
                'title'       => 'Identifique o Pão',
                'description' => 'Reconheça diferentes tipos de pães pela imagem.',
                'type'        => 'visual_quiz',
                'config'      => [
                    'questions' => [
                        [
                            'id'       => 1,
                            'question' => 'Qual é este tipo de pão?',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Fresh_made_bread_05.jpg/800px-Fresh_made_bread_05.jpg',
                            'options'  => [
                                ['text' => 'Pão Francês',  'correct' => true],
                                ['text' => 'Ciabatta',     'correct' => false],
                                ['text' => 'Baguete',      'correct' => false],
                                ['text' => 'Pão de Forma', 'correct' => false],
                            ],
                        ],
                        [
                            'id'       => 2,
                            'question' => 'Que pão é este?',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Baguette_de_campagne.jpg/800px-Baguette_de_campagne.jpg',
                            'options'  => [
                                ['text' => 'Pão Italiano', 'correct' => false],
                                ['text' => 'Baguete',      'correct' => true],
                                ['text' => 'Pão Sírio',    'correct' => false],
                                ['text' => 'Broa',         'correct' => false],
                            ],
                        ],
                        [
                            'id'       => 3,
                            'question' => 'Identifique este pão:',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Croissant%2C_November_2010.jpg/800px-Croissant%2C_November_2010.jpg',
                            'options'  => [
                                ['text' => 'Brioche',   'correct' => false],
                                ['text' => 'Croissant', 'correct' => true],
                                ['text' => 'Folhado',   'correct' => false],
                                ['text' => 'Sonho',     'correct' => false],
                            ],
                        ],
                    ],
                ],
                'order' => 5,
            ],
            [
                'slug'        => 'vquiz-ingredientes',
                'title'       => 'Identifique o Ingrediente',
                'description' => 'Reconheça ingredientes de padaria pela foto.',
                'type'        => 'visual_quiz',
                'config'      => [
                    'questions' => [
                        [
                            'id'       => 1,
                            'question' => 'O que é este ingrediente?',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Foods_%28cropped%29_-_Pair_of_Eggs.jpg/800px-Foods_%28cropped%29_-_Pair_of_Eggs.jpg',
                            'options'  => [
                                ['text' => 'Ovo',       'correct' => true],
                                ['text' => 'Manteiga',  'correct' => false],
                                ['text' => 'Polvilho',  'correct' => false],
                                ['text' => 'Queijo',    'correct' => false],
                            ],
                        ],
                        [
                            'id'       => 2,
                            'question' => 'Identifique este ingrediente:',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/800px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
                            'options'  => [
                                ['text' => 'Farinha de rosca', 'correct' => false],
                                ['text' => 'Amido de milho',   'correct' => false],
                                ['text' => 'Farinha de trigo', 'correct' => true],
                                ['text' => 'Polvilho doce',    'correct' => false],
                            ],
                        ],
                        [
                            'id'       => 3,
                            'question' => 'Que ingrediente é este?',
                            'imageUrl' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Saccharomyces_cerevisiae_-_compressed_yeast_-_1.jpg/800px-Saccharomyces_cerevisiae_-_compressed_yeast_-_1.jpg',
                            'options'  => [
                                ['text' => 'Manteiga',          'correct' => false],
                                ['text' => 'Fermento biológico','correct' => true],
                                ['text' => 'Bicarbonato',       'correct' => false],
                                ['text' => 'Sal grosso',        'correct' => false],
                            ],
                        ],
                    ],
                ],
                'order' => 6,
            ],

            // ── TRUE/FALSE (2) ──────────────────────────────────────
            [
                'slug'        => 'tf-higiene',
                'title'       => 'V ou F: Higiene na Padaria',
                'description' => 'Teste seus conhecimentos sobre boas práticas de higiene.',
                'type'        => 'true_false',
                'config'      => [
                    'statements' => [
                        ['id' => 1, 'text' => 'É obrigatório lavar as mãos antes de manipular alimentos.',           'correct' => true],
                        ['id' => 2, 'text' => 'Usar relógio e anéis é permitido durante a manipulação de alimentos.', 'correct' => false],
                        ['id' => 3, 'text' => 'A touca descartável evita a queda de cabelos nos produtos.',           'correct' => true],
                        ['id' => 4, 'text' => 'Alimentos podem ficar fora da refrigeração por tempo ilimitado.',      'correct' => false],
                        ['id' => 5, 'text' => 'Superfícies de trabalho devem ser higienizadas antes e depois do uso.','correct' => true],
                        ['id' => 6, 'text' => 'É permitido espirrar e tossir perto dos alimentos se usar máscara.',  'correct' => false],
                    ],
                ],
                'order' => 7,
            ],
            [
                'slug'        => 'tf-panificacao',
                'title'       => 'V ou F: Panificação',
                'description' => 'Afirmações sobre técnicas e ingredientes de panificação.',
                'type'        => 'true_false',
                'config'      => [
                    'statements' => [
                        ['id' => 1, 'text' => 'O glúten é formado pela mistura de proteínas da farinha com água.',      'correct' => true],
                        ['id' => 2, 'text' => 'Fermento químico e fermento biológico funcionam da mesma forma.',        'correct' => false],
                        ['id' => 3, 'text' => 'A sova desenvolve a rede de glúten, deixando a massa mais elástica.',    'correct' => true],
                        ['id' => 4, 'text' => 'Sal deve ser colocado em contato direto com o fermento biológico.',      'correct' => false],
                        ['id' => 5, 'text' => 'A temperatura do forno influencia diretamente a crosta do pão.',        'correct' => true],
                        ['id' => 6, 'text' => 'A fermentação é o processo em que leveduras produzem CO₂ e álcool.',     'correct' => true],
                    ],
                ],
                'order' => 8,
            ],

            // ── MATCHING (2) ────────────────────────────────────────
            [
                'slug'        => 'match-funcao-ingrediente',
                'title'       => 'Conecte: Ingrediente → Função',
                'description' => 'Associe cada ingrediente à sua função na receita.',
                'type'        => 'matching',
                'config'      => [
                    'pairs' => [
                        ['id' => 1, 'left' => 'Fermento biológico', 'right' => 'Faz a massa crescer'],
                        ['id' => 2, 'left' => 'Sal',                'right' => 'Realça o sabor e fortalece o glúten'],
                        ['id' => 3, 'left' => 'Açúcar',             'right' => 'Alimenta o fermento e dá cor à crosta'],
                        ['id' => 4, 'left' => 'Gordura',            'right' => 'Deixa a massa macia e úmida'],
                        ['id' => 5, 'left' => 'Ovo',                'right' => 'Dá estrutura e cor ao produto'],
                    ],
                ],
                'order' => 9,
            ],
            [
                'slug'        => 'match-utensilio-uso',
                'title'       => 'Conecte: Utensílio → Uso',
                'description' => 'Associe cada utensílio à sua utilidade na padaria.',
                'type'        => 'matching',
                'config'      => [
                    'pairs' => [
                        ['id' => 1, 'left' => 'Rolo de massa',   'right' => 'Abrir e nivelar massas'],
                        ['id' => 2, 'left' => 'Balança digital', 'right' => 'Pesar ingredientes com precisão'],
                        ['id' => 3, 'left' => 'Batedeira',       'right' => 'Misturar e arejar massas'],
                        ['id' => 4, 'left' => 'Raspadeira',      'right' => 'Cortar e manipular a massa'],
                        ['id' => 5, 'left' => 'Termômetro',      'right' => 'Medir temperatura de líquidos e forno'],
                    ],
                ],
                'order' => 10,
            ],

            // ── WORD SCRAMBLE (2) ───────────────────────────────────
            [
                'slug'        => 'scramble-ingredientes',
                'title'       => 'Descubra: Ingredientes',
                'description' => 'Desembaralhe as letras para formar nomes de ingredientes.',
                'type'        => 'word_scramble',
                'config'      => [
                    'words' => [
                        ['id' => 1, 'word' => 'FARINHA',   'hint' => 'Base de quase todas as massas'],
                        ['id' => 2, 'word' => 'FERMENTO',  'hint' => 'Faz a massa crescer'],
                        ['id' => 3, 'word' => 'MANTEIGA',  'hint' => 'Gordura de origem animal usada em massas folhadas'],
                        ['id' => 4, 'word' => 'ACUCAR',    'hint' => 'Adoça e ajuda a dourar a crosta'],
                        ['id' => 5, 'word' => 'CACAU',     'hint' => 'Ingrediente principal do chocolate'],
                    ],
                ],
                'order' => 11,
            ],
            [
                'slug'        => 'scramble-produtos',
                'title'       => 'Descubra: Produtos de Padaria',
                'description' => 'Desembaralhe as letras para descobrir produtos de padaria.',
                'type'        => 'word_scramble',
                'config'      => [
                    'words' => [
                        ['id' => 1, 'word' => 'CROISSANT', 'hint' => 'Massa folhada em formato de meia-lua'],
                        ['id' => 2, 'word' => 'BRIOCHE',   'hint' => 'Pão doce francês rico em ovos e manteiga'],
                        ['id' => 3, 'word' => 'BAGUETE',   'hint' => 'Pão longo e crocante de origem francesa'],
                        ['id' => 4, 'word' => 'SONHO',     'hint' => 'Massa frita recheada com creme'],
                        ['id' => 5, 'word' => 'FOCACCIA',  'hint' => 'Pão achatado italiano com azeite'],
                    ],
                ],
                'order' => 12,
            ],

            // ── NEXT INGREDIENT (2) ─────────────────────────────────
            [
                'slug'        => 'ni-pao-frances',
                'title'       => 'Qual o Próximo?: Pão Francês',
                'description' => 'Adivinhe o próximo ingrediente do pão francês.',
                'type'        => 'next_ingredient',
                'config'      => [
                    'recipeName'  => 'Pão Francês',
                    'ingredients' => [
                        ['id' => 1, 'name' => 'Farinha de trigo', 'emoji' => '🌾'],
                        ['id' => 2, 'name' => 'Água',             'emoji' => '💧'],
                        ['id' => 3, 'name' => 'Sal',              'emoji' => '🧂'],
                        ['id' => 4, 'name' => 'Fermento',         'emoji' => '🧪'],
                        ['id' => 5, 'name' => 'Açúcar',           'emoji' => '🍬'],
                        ['id' => 6, 'name' => 'Gordura vegetal',  'emoji' => '🫙'],
                    ],
                ],
                'order' => 13,
            ],
            [
                'slug'        => 'ni-bolo-chocolate',
                'title'       => 'Qual o Próximo?: Bolo de Chocolate',
                'description' => 'Adivinhe a sequência de ingredientes do bolo de chocolate.',
                'type'        => 'next_ingredient',
                'config'      => [
                    'recipeName'  => 'Bolo de Chocolate',
                    'ingredients' => [
                        ['id' => 1, 'name' => 'Ovos',              'emoji' => '🥚'],
                        ['id' => 2, 'name' => 'Açúcar',            'emoji' => '🍬'],
                        ['id' => 3, 'name' => 'Óleo',              'emoji' => '🫗'],
                        ['id' => 4, 'name' => 'Leite',             'emoji' => '🥛'],
                        ['id' => 5, 'name' => 'Farinha de trigo',  'emoji' => '🌾'],
                        ['id' => 6, 'name' => 'Cacau em pó',       'emoji' => '🍫'],
                        ['id' => 7, 'name' => 'Fermento químico',  'emoji' => '💨'],
                    ],
                ],
                'order' => 14,
            ],
        ];

        foreach ($games as $game) {
            Game::updateOrCreate(
                ['slug' => $game['slug']],
                array_merge($game, ['is_active' => true])
            );
        }
    }
}
