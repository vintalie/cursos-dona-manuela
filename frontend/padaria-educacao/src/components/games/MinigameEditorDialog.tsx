import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createGame, updateGame, type GameFormData } from "@/services/game.admin.service";
import type { Game } from "@/services/game.service";
import { useAlertPopup } from "@/contexts/AlertPopupContext";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import UrlFieldWithPicker from "@/components/media/UrlFieldWithPicker";

interface MinigameEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGame: Game | null;
  onSaved: () => void;
}

interface MemoryPair {
  label: string;
  emoji: string;
}

interface OrderingItem {
  text: string;
}

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  question: string;
  imageUrl: string;
  options: QuizOption[];
}

interface TFStatement {
  text: string;
  correct: boolean;
}

interface MatchPairEditable {
  left: string;
  right: string;
}

interface ScrambleWordEditable {
  word: string;
  hint: string;
}

interface IngredientEditable {
  name: string;
  emoji: string;
}

const TYPE_LABELS: Record<string, string> = {
  memory: "Jogo da Memória",
  ordering: "Monte a Receita",
  visual_quiz: "Identifique o Produto",
  true_false: "Verdadeiro ou Falso",
  matching: "Conecte os Pares",
  word_scramble: "Descubra a Palavra",
  next_ingredient: "Qual o Próximo?",
};

export default function MinigameEditorDialog({
  open,
  onOpenChange,
  editGame,
  onSaved,
}: MinigameEditorDialogProps) {
  const { showAlert } = useAlertPopup();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GameFormData["type"]>("memory");
  const [loading, setLoading] = useState(false);

  const [memoryPairs, setMemoryPairs] = useState<MemoryPair[]>([{ label: "", emoji: "" }]);
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>([{ text: "" }]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: "", imageUrl: "", options: [{ text: "", correct: true }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }] },
  ]);
  const [tfStatements, setTfStatements] = useState<TFStatement[]>([{ text: "", correct: true }]);
  const [matchPairs, setMatchPairs] = useState<MatchPairEditable[]>([{ left: "", right: "" }]);
  const [scrambleWords, setScrambleWords] = useState<ScrambleWordEditable[]>([{ word: "", hint: "" }]);
  const [niRecipeName, setNiRecipeName] = useState("");
  const [niIngredients, setNiIngredients] = useState<IngredientEditable[]>([{ name: "", emoji: "" }]);

  useEffect(() => {
    if (!open) return;
    if (editGame) {
      setTitle(editGame.title);
      setDescription(editGame.description ?? "");
      setType(editGame.type as GameFormData["type"]);
      loadConfig(editGame);
    } else {
      setTitle("");
      setDescription("");
      setType("memory");
      setMemoryPairs([{ label: "", emoji: "" }]);
      setOrderingItems([{ text: "" }]);
      setQuizQuestions([
        { question: "", imageUrl: "", options: [{ text: "", correct: true }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }] },
      ]);
      setTfStatements([{ text: "", correct: true }]);
      setMatchPairs([{ left: "", right: "" }]);
      setScrambleWords([{ word: "", hint: "" }]);
      setNiRecipeName("");
      setNiIngredients([{ name: "", emoji: "" }]);
    }
  }, [open, editGame?.id]);

  function loadConfig(game: Game) {
    const cfg = game.config as Record<string, unknown>;
    if (game.type === "memory" && Array.isArray(cfg.pairs)) {
      setMemoryPairs(
        (cfg.pairs as { label: string; emoji: string }[]).map((p) => ({ label: p.label, emoji: p.emoji }))
      );
    }
    if (game.type === "ordering" && Array.isArray(cfg.items)) {
      setOrderingItems(
        (cfg.items as { text: string }[]).map((i) => ({ text: i.text }))
      );
    }
    if (game.type === "visual_quiz" && Array.isArray(cfg.questions)) {
      setQuizQuestions(
        (cfg.questions as QuizQuestion[]).map((q) => ({
          question: q.question,
          imageUrl: q.imageUrl,
          options: q.options.map((o) => ({ text: o.text, correct: o.correct })),
        }))
      );
    }
    if (game.type === "true_false" && Array.isArray(cfg.statements)) {
      setTfStatements(
        (cfg.statements as TFStatement[]).map((s) => ({ text: s.text, correct: s.correct }))
      );
    }
    if (game.type === "matching" && Array.isArray(cfg.pairs)) {
      setMatchPairs(
        (cfg.pairs as MatchPairEditable[]).map((p) => ({ left: p.left, right: p.right }))
      );
    }
    if (game.type === "word_scramble" && Array.isArray(cfg.words)) {
      setScrambleWords(
        (cfg.words as ScrambleWordEditable[]).map((w) => ({ word: w.word, hint: w.hint }))
      );
    }
    if (game.type === "next_ingredient") {
      setNiRecipeName((cfg.recipeName as string) ?? "");
      if (Array.isArray(cfg.ingredients)) {
        setNiIngredients(
          (cfg.ingredients as IngredientEditable[]).map((i) => ({ name: i.name, emoji: i.emoji }))
        );
      }
    }
  }

  function buildConfig(): Record<string, unknown> {
    if (type === "memory") {
      return {
        pairs: memoryPairs
          .filter((p) => p.label.trim())
          .map((p, i) => ({ id: i + 1, label: p.label.trim(), emoji: p.emoji.trim() || "🔲" })),
      };
    }
    if (type === "ordering") {
      return {
        items: orderingItems
          .filter((i) => i.text.trim())
          .map((i, idx) => ({ id: idx + 1, text: i.text.trim() })),
      };
    }
    if (type === "visual_quiz") {
      return {
        questions: quizQuestions
          .filter((q) => q.question.trim())
          .map((q, idx) => ({
            id: idx + 1,
            question: q.question.trim(),
            imageUrl: q.imageUrl.trim(),
            options: q.options.map((o) => ({ text: o.text.trim(), correct: o.correct })),
          })),
      };
    }
    if (type === "true_false") {
      return {
        statements: tfStatements
          .filter((s) => s.text.trim())
          .map((s, i) => ({ id: i + 1, text: s.text.trim(), correct: s.correct })),
      };
    }
    if (type === "matching") {
      return {
        pairs: matchPairs
          .filter((p) => p.left.trim() && p.right.trim())
          .map((p, i) => ({ id: i + 1, left: p.left.trim(), right: p.right.trim() })),
      };
    }
    if (type === "word_scramble") {
      return {
        words: scrambleWords
          .filter((w) => w.word.trim())
          .map((w, i) => ({ id: i + 1, word: w.word.trim().toUpperCase(), hint: w.hint.trim() })),
      };
    }
    return {
      recipeName: niRecipeName.trim(),
      ingredients: niIngredients
        .filter((i) => i.name.trim())
        .map((i, idx) => ({ id: idx + 1, name: i.name.trim(), emoji: i.emoji.trim() || "🔲" })),
    };
  }

  function validate(): string | null {
    if (!title.trim()) return "Informe o título.";
    const cfg = buildConfig();
    if (type === "memory") {
      const pairs = cfg.pairs as unknown[];
      if (!pairs || pairs.length < 2) return "Adicione pelo menos 2 pares.";
    }
    if (type === "ordering") {
      const items = cfg.items as unknown[];
      if (!items || items.length < 2) return "Adicione pelo menos 2 itens.";
    }
    if (type === "visual_quiz") {
      const questions = cfg.questions as { options: { text: string }[] }[];
      if (!questions || questions.length < 1) return "Adicione pelo menos 1 questão.";
      for (const q of questions) {
        const filled = q.options.filter((o) => o.text);
        if (filled.length < 2) return "Cada questão precisa de pelo menos 2 opções.";
      }
    }
    if (type === "true_false") {
      const statements = cfg.statements as unknown[];
      if (!statements || statements.length < 1) return "Adicione pelo menos 1 afirmação.";
    }
    if (type === "matching") {
      const pairs = cfg.pairs as unknown[];
      if (!pairs || pairs.length < 2) return "Adicione pelo menos 2 pares.";
    }
    if (type === "word_scramble") {
      const words = cfg.words as unknown[];
      if (!words || words.length < 1) return "Adicione pelo menos 1 palavra.";
    }
    if (type === "next_ingredient") {
      if (!niRecipeName.trim()) return "Informe o nome da receita.";
      const ings = cfg.ingredients as unknown[];
      if (!ings || ings.length < 3) return "Adicione pelo menos 3 ingredientes.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { showAlert({ type: "error", message: err }); return; }

    setLoading(true);
    try {
      const data: GameFormData = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        config: buildConfig(),
      };
      if (editGame) {
        await updateGame(editGame.id, data);
        showAlert({ type: "success", message: "Minigame atualizado!" });
      } else {
        await createGame(data);
        showAlert({ type: "success", message: "Minigame criado!" });
      }
      onSaved();
      onOpenChange(false);
    } catch {
      showAlert({ type: "error", message: "Erro ao salvar o minigame." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="minigame-editor-dialog">
        <DialogHeader>
          <DialogTitle>{editGame ? "Editar Minigame" : "Criar Minigame"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="minigame-editor-form">
          <div className="minigame-editor-fields">
            <input
              placeholder="Título do minigame"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="minigame-editor-input"
            />
            <input
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="minigame-editor-input"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GameFormData["type"])}
              disabled={!!editGame}
              className="minigame-editor-select"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="minigame-editor-config">
            {type === "memory" && (
              <MemoryConfig pairs={memoryPairs} onChange={setMemoryPairs} />
            )}
            {type === "ordering" && (
              <OrderingConfig items={orderingItems} onChange={setOrderingItems} />
            )}
            {type === "visual_quiz" && (
              <VisualQuizConfig questions={quizQuestions} onChange={setQuizQuestions} />
            )}
            {type === "true_false" && (
              <TrueFalseConfig statements={tfStatements} onChange={setTfStatements} />
            )}
            {type === "matching" && (
              <MatchingConfig pairs={matchPairs} onChange={setMatchPairs} />
            )}
            {type === "word_scramble" && (
              <WordScrambleConfig words={scrambleWords} onChange={setScrambleWords} />
            )}
            {type === "next_ingredient" && (
              <NextIngredientConfig
                recipeName={niRecipeName}
                onRecipeNameChange={setNiRecipeName}
                ingredients={niIngredients}
                onIngredientsChange={setNiIngredients}
              />
            )}
          </div>

          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="minigame-editor-btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="minigame-editor-btn-save">
              {loading ? "Salvando..." : editGame ? "Salvar" : "Criar"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemoryConfig({ pairs, onChange }: { pairs: MemoryPair[]; onChange: (p: MemoryPair[]) => void }) {
  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Pares de cartas</h4>
      {pairs.map((pair, i) => (
        <div key={i} className="minigame-config-row">
          <input
            placeholder="Nome (ex: Farinha)"
            value={pair.label}
            onChange={(e) => {
              const next = [...pairs];
              next[i] = { ...pair, label: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <input
            placeholder="Emoji"
            value={pair.emoji}
            onChange={(e) => {
              const next = [...pairs];
              next[i] = { ...pair, emoji: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input w-20"
          />
          <button
            type="button"
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}
            className="minigame-config-remove"
            disabled={pairs.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...pairs, { label: "", emoji: "" }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar par
      </button>
    </div>
  );
}

function OrderingConfig({ items, onChange }: { items: OrderingItem[]; onChange: (i: OrderingItem[]) => void }) {
  function moveItem(from: number, to: number) {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Itens na ordem correta</h4>
      {items.map((item, i) => (
        <div key={i} className="minigame-config-row">
          <span className="minigame-config-number">{i + 1}.</span>
          <input
            placeholder={`Passo ${i + 1}`}
            value={item.text}
            onChange={(e) => {
              const next = [...items];
              next[i] = { text: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <button type="button" onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="minigame-config-move">
            <ArrowUp size={14} />
          </button>
          <button type="button" onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="minigame-config-move">
            <ArrowDown size={14} />
          </button>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="minigame-config-remove" disabled={items.length <= 1}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { text: "" }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar item
      </button>
    </div>
  );
}

function VisualQuizConfig({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  function updateQuestion(idx: number, partial: Partial<QuizQuestion>) {
    const next = [...questions];
    next[idx] = { ...next[idx], ...partial };
    onChange(next);
  }

  function updateOption(qIdx: number, oIdx: number, text: string) {
    const next = [...questions];
    const opts = [...next[qIdx].options];
    opts[oIdx] = { ...opts[oIdx], text };
    next[qIdx] = { ...next[qIdx], options: opts };
    onChange(next);
  }

  function setCorrectOption(qIdx: number, oIdx: number) {
    const next = [...questions];
    const opts = next[qIdx].options.map((o, i) => ({ ...o, correct: i === oIdx }));
    next[qIdx] = { ...next[qIdx], options: opts };
    onChange(next);
  }

  function addQuestion() {
    onChange([
      ...questions,
      { question: "", imageUrl: "", options: [{ text: "", correct: true }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }] },
    ]);
  }

  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Questões</h4>
      {questions.map((q, qi) => (
        <div key={qi} className="minigame-quiz-question">
          <div className="minigame-quiz-question-header">
            <span className="minigame-config-number">Q{qi + 1}</span>
            <button type="button" onClick={() => onChange(questions.filter((_, j) => j !== qi))} className="minigame-config-remove" disabled={questions.length <= 1}>
              <Trash2 size={14} />
            </button>
          </div>
          <UrlFieldWithPicker
            value={q.imageUrl}
            onChange={(v) => updateQuestion(qi, { imageUrl: v })}
            type="image"
            placeholder="URL da imagem ou selecione da biblioteca"
            className="minigame-quiz-question"
          />
          <input
            placeholder="Pergunta (ex: O que é este produto?)"
            value={q.question}
            onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            className="minigame-config-input"
          />
          <div className="minigame-quiz-options">
            {q.options.map((opt, oi) => (
              <div key={oi} className="minigame-quiz-option">
                <label className="minigame-quiz-radio">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={opt.correct}
                    onChange={() => setCorrectOption(qi, oi)}
                  />
                </label>
                <input
                  placeholder={`Opção ${oi + 1}`}
                  value={opt.text}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  className="minigame-config-input flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="minigame-config-add">
        <Plus size={14} /> Adicionar questão
      </button>
    </div>
  );
}

function TrueFalseConfig({ statements, onChange }: { statements: TFStatement[]; onChange: (s: TFStatement[]) => void }) {
  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Afirmações</h4>
      {statements.map((s, i) => (
        <div key={i} className="minigame-config-row">
          <input
            placeholder={`Afirmação ${i + 1}`}
            value={s.text}
            onChange={(e) => {
              const next = [...statements];
              next[i] = { ...s, text: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <select
            value={s.correct ? "true" : "false"}
            onChange={(e) => {
              const next = [...statements];
              next[i] = { ...s, correct: e.target.value === "true" };
              onChange(next);
            }}
            className="minigame-config-input w-32"
          >
            <option value="true">Verdadeiro</option>
            <option value="false">Falso</option>
          </select>
          <button
            type="button"
            onClick={() => onChange(statements.filter((_, j) => j !== i))}
            className="minigame-config-remove"
            disabled={statements.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...statements, { text: "", correct: true }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar afirmação
      </button>
    </div>
  );
}

function MatchingConfig({ pairs, onChange }: { pairs: MatchPairEditable[]; onChange: (p: MatchPairEditable[]) => void }) {
  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Pares para associar</h4>
      {pairs.map((pair, i) => (
        <div key={i} className="minigame-config-row">
          <input
            placeholder="Item esquerda (ex: Fermento)"
            value={pair.left}
            onChange={(e) => {
              const next = [...pairs];
              next[i] = { ...pair, left: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <span className="text-muted-foreground text-sm shrink-0">→</span>
          <input
            placeholder="Item direita (ex: Faz a massa crescer)"
            value={pair.right}
            onChange={(e) => {
              const next = [...pairs];
              next[i] = { ...pair, right: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}
            className="minigame-config-remove"
            disabled={pairs.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...pairs, { left: "", right: "" }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar par
      </button>
    </div>
  );
}

function WordScrambleConfig({ words, onChange }: { words: ScrambleWordEditable[]; onChange: (w: ScrambleWordEditable[]) => void }) {
  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Palavras para desembaralhar</h4>
      {words.map((w, i) => (
        <div key={i} className="minigame-config-row">
          <input
            placeholder="Palavra (ex: FERMENTO)"
            value={w.word}
            onChange={(e) => {
              const next = [...words];
              next[i] = { ...w, word: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <input
            placeholder="Dica"
            value={w.hint}
            onChange={(e) => {
              const next = [...words];
              next[i] = { ...w, hint: e.target.value };
              onChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(words.filter((_, j) => j !== i))}
            className="minigame-config-remove"
            disabled={words.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...words, { word: "", hint: "" }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar palavra
      </button>
    </div>
  );
}

function NextIngredientConfig({
  recipeName,
  onRecipeNameChange,
  ingredients,
  onIngredientsChange,
}: {
  recipeName: string;
  onRecipeNameChange: (v: string) => void;
  ingredients: IngredientEditable[];
  onIngredientsChange: (i: IngredientEditable[]) => void;
}) {
  return (
    <div className="minigame-config-section">
      <h4 className="minigame-config-title">Receita</h4>
      <input
        placeholder="Nome da receita (ex: Pão Francês)"
        value={recipeName}
        onChange={(e) => onRecipeNameChange(e.target.value)}
        className="minigame-config-input mb-3"
      />
      <h4 className="minigame-config-title">Ingredientes na ordem correta</h4>
      {ingredients.map((ing, i) => (
        <div key={i} className="minigame-config-row">
          <span className="minigame-config-number">{i + 1}.</span>
          <input
            placeholder="Ingrediente (ex: Farinha de trigo)"
            value={ing.name}
            onChange={(e) => {
              const next = [...ingredients];
              next[i] = { ...ing, name: e.target.value };
              onIngredientsChange(next);
            }}
            className="minigame-config-input flex-1"
          />
          <input
            placeholder="Emoji"
            value={ing.emoji}
            onChange={(e) => {
              const next = [...ingredients];
              next[i] = { ...ing, emoji: e.target.value };
              onIngredientsChange(next);
            }}
            className="minigame-config-input w-20"
          />
          <button
            type="button"
            onClick={() => onIngredientsChange(ingredients.filter((_, j) => j !== i))}
            className="minigame-config-remove"
            disabled={ingredients.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onIngredientsChange([...ingredients, { name: "", emoji: "" }])} className="minigame-config-add">
        <Plus size={14} /> Adicionar ingrediente
      </button>
    </div>
  );
}
