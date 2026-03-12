import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import {
  getCourses,
  createCourse,
  updateCourse,
  getCourse,
  deleteCourse,
} from "@/services/course.service";
import {
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from "@/services/module.service";
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/services/lesson.service";
import {
  createAssessment,
  getAssessment,
  updateAssessment,
  deleteAssessment,
} from "@/services/assessment.service";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/services/question.service";
import {
  createOption,
  updateOption,
} from "@/services/option.service";
import { getCategories, createCategory } from "@/services/category.service";
import type { Course, Module, Lesson, Assessment, Question } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import WysiwygEditor from "@/components/ui/WysiwygEditor";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import type { Category } from "@/types";

type ExpandedForm = "course" | "materia" | "aula" | "avaliacao" | "pergunta" | null;

function errMsg(err: unknown): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao salvar";
}

function Breadcrumb({
  course,
  module,
  lesson,
  assessment,
  suffix,
}: {
  course?: Course | null;
  module?: Module | null;
  lesson?: Lesson | null;
  assessment?: Assessment | null;
  suffix?: string;
}) {
  const parts: string[] = [];
  if (course) parts.push(course.title);
  if (module) parts.push(module.title);
  if (lesson) parts.push(lesson.title);
  if (assessment) parts.push(assessment.title);
  if (suffix) parts.push(suffix);
  if (parts.length === 0) return null;
  return (
    <p className="creation-breadcrumb">
      {parts.join(" › ")}
    </p>
  );
}

export default function ManagerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleDetail, setModuleDetail] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentDetail, setAssessmentDetail] = useState<Assessment | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [expandedForm, setExpandedForm] = useState<ExpandedForm>("course");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "course" | "module" | "lesson" | "assessment" | "question"; id: number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState({
    aulas: true,
    avaliacoesMateria: true,
    avaliacoesAula: true,
    perguntas: true,
  });

  useEffect(() => {
    setDocumentTitle("Painel do Gerente");
  }, []);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setCourseDetail(null);
      setSelectedModule(null);
      setModuleDetail(null);
      setSelectedLesson(null);
      setSelectedAssessment(null);
      setAssessmentDetail(null);
      return;
    }
    getCourse(selectedCourse.id).then(setCourseDetail).catch(() => setCourseDetail(null));
  }, [selectedCourse?.id]);

  useEffect(() => {
    if (!selectedModule) {
      setModuleDetail(null);
      setSelectedLesson(null);
      setSelectedAssessment(null);
      setAssessmentDetail(null);
      return;
    }
    getModule(selectedModule.id).then(setModuleDetail).catch(() => setModuleDetail(null));
  }, [selectedModule?.id]);

  useEffect(() => {
    if (!selectedAssessment) {
      setAssessmentDetail(null);
      setSelectedQuestion(null);
      return;
    }
    getAssessment(selectedAssessment.id).then(setAssessmentDetail).catch(() => setAssessmentDetail(null));
  }, [selectedAssessment?.id]);

  const showMsg = (type: "error" | "success", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const refreshCourses = () => getCourses().then(setCourses);
  const refreshCourseDetail = () => selectedCourse && getCourse(selectedCourse.id).then(setCourseDetail);
  const refreshModuleDetail = () => selectedModule && getModule(selectedModule.id).then(setModuleDetail);
  const refreshAssessmentDetail = () => selectedAssessment && getAssessment(selectedAssessment.id).then(setAssessmentDetail);

  const modules = courseDetail?.modules ?? [];
  const lessons = moduleDetail?.lessons ?? [];
  const assessments = moduleDetail?.assessments ?? [];
  const assessmentsDaMateria = assessments.filter((a) => !a.lesson_id);
  const assessmentsPorAula = lessons.map((l) => ({
    lesson: l,
    items: assessments.filter((a) => a.lesson_id === l.id),
  }));
  const questions = assessmentDetail?.questions ?? [];

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setSelectedModule(null);
    setSelectedLesson(null);
    setSelectedAssessment(null);
    setExpandedForm("materia");
  };

  const handleExpandCourseForm = () => setExpandedForm(expandedForm === "course" ? null : "course");

  const handleCreateNewCourse = () => {
    setSelectedCourse(null);
    setExpandedForm("course");
  };

  const handleSelectModule = (m: Module) => {
    setSelectedModule(m);
    setSelectedLesson(null);
    setSelectedAssessment(null);
    setExpandedForm("aula");
  };

  const handleSelectLesson = (l: Lesson) => {
    setSelectedLesson(l);
    setSelectedAssessment(null);
    setExpandedForm("avaliacao");
  };

  const handleSelectAssessment = (a: Assessment) => {
    setSelectedAssessment(a);
    setSelectedQuestion(null);
    setExpandedForm("pergunta");
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setExpandedForm("pergunta");
  };

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      switch (deleteTarget.type) {
        case "course":
          await deleteCourse(deleteTarget.id);
          setSelectedCourse(null);
          refreshCourses();
          break;
        case "module":
          await deleteModule(deleteTarget.id);
          setSelectedModule(null);
          refreshCourseDetail();
          break;
        case "lesson":
          await deleteLesson(deleteTarget.id);
          setSelectedLesson(null);
          refreshModuleDetail();
          break;
        case "assessment":
          await deleteAssessment(deleteTarget.id);
          setSelectedAssessment(null);
          refreshModuleDetail();
          break;
        case "question":
          await deleteQuestion(deleteTarget.id);
          refreshAssessmentDetail();
          break;
      }
      showMsg("success", "Excluído com sucesso!");
    } catch (err) {
      showMsg("error", errMsg(err));
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  const handleCreateNewMateria = () => {
    setSelectedModule(null);
    setExpandedForm("materia");
  };
  const handleCreateNewAula = () => {
    setSelectedLesson(null);
    setExpandedForm("aula");
  };
  const handleCreateNewAvaliacao = (lesson?: Lesson | null) => {
    setSelectedAssessment(null);
    setSelectedLesson(lesson ?? null);
    setExpandedForm("avaliacao");
  };
  const handleCreateNewPergunta = () => {
    setSelectedQuestion(null);
    setExpandedForm("pergunta");
  };

  return (
    <div className="dashboard">
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Criação de Conteúdo</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-700"}`}>
          {message.text}
        </div>
      )}

      <div className="creation-grid">
        <aside className="creation-sidebar">
          <section className="creation-section">
            <h3 className="creation-section-title">Cursos</h3>
            <button type="button" className="creation-item creation-item-new" onClick={handleCreateNewCourse}>
              + Criar novo curso
            </button>
            <ul className="creation-list">
              {courses.map((c) => (
                <li key={c.id} className="creation-list-item">
                  <button
                    type="button"
                    className={`creation-item ${selectedCourse?.id === c.id ? "active" : ""}`}
                    onClick={() => handleSelectCourse(c)}
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "course", id: c.id, name: c.title }); }}
                    title="Deletar curso"
                  >
                    Deletar
                  </button>
                </li>
              ))}
            </ul>
            {courses.length === 0 && <p className="text-sm text-muted-foreground">Nenhum curso. Crie um à direita.</p>}
          </section>

          {selectedCourse && (
            <section className="creation-section">
              <h3 className="creation-section-title">Matérias de «{selectedCourse.title}»</h3>
              <button type="button" className="creation-item creation-item-new" onClick={handleCreateNewMateria}>
                + Criar nova matéria
              </button>
              <ul className="creation-list">
                {modules.map((m) => (
                  <li key={m.id} className="creation-list-item">
                    <button
                      type="button"
                      className={`creation-item ${selectedModule?.id === m.id ? "active" : ""}`}
                      onClick={() => handleSelectModule(m)}
                    >
                      {m.title}
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "module", id: m.id, name: m.title }); }}
                      title="Deletar matéria"
                    >
                      Deletar
                    </button>
                  </li>
                ))}
              </ul>
              {modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma matéria.</p>}
            </section>
          )}

          {selectedModule && (
            <>
              <section className="creation-section">
                <button
                  type="button"
                  className="creation-section-title flex items-center gap-2 w-full text-left"
                  onClick={() => setSidebarExpanded((s) => ({ ...s, aulas: !s.aulas }))}
                >
                  {sidebarExpanded.aulas ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Aulas de «{selectedModule.title}»
                </button>
                <button type="button" className="creation-item creation-item-new" onClick={handleCreateNewAula}>
                  + Criar nova aula
                </button>
                <ul className="creation-list">
                  {(sidebarExpanded.aulas ? lessons : (selectedLesson ? lessons.filter((l) => l.id === selectedLesson.id) : [])).map((l) => (
                    <li key={l.id} className="creation-list-item">
                      <button
                        type="button"
                        className={`creation-item ${selectedLesson?.id === l.id ? "active" : ""}`}
                        onClick={() => handleSelectLesson(l)}
                      >
                        {l.title}
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "lesson", id: l.id, name: l.title }); }}
                        title="Deletar aula"
                      >
                        Deletar
                      </button>
                    </li>
                  ))}
                </ul>
                {lessons.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula.</p>}
              </section>

              <section className="creation-section">
                <button
                  type="button"
                  className="creation-section-title flex items-center gap-2 w-full text-left"
                  onClick={() => setSidebarExpanded((s) => ({ ...s, avaliacoesMateria: !s.avaliacoesMateria }))}
                >
                  {sidebarExpanded.avaliacoesMateria ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Avaliações da matéria (valem nota)
                </button>
                <button type="button" className="creation-item creation-item-new" onClick={handleCreateNewAvaliacao}>
                  + Criar nova avaliação
                </button>
                <ul className="creation-list">
                  {(sidebarExpanded.avaliacoesMateria ? assessmentsDaMateria : (selectedAssessment && !selectedAssessment.lesson_id ? assessmentsDaMateria.filter((a) => a.id === selectedAssessment.id) : [])).map((a) => (
                    <li key={a.id} className="creation-list-item">
                      <button
                        type="button"
                        className={`creation-item ${selectedAssessment?.id === a.id ? "active" : ""}`}
                        onClick={() => handleSelectAssessment(a)}
                      >
                        {a.title}
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "assessment", id: a.id, name: a.title }); }}
                        title="Deletar avaliação"
                      >
                        Deletar
                      </button>
                    </li>
                  ))}
                </ul>
                {assessmentsDaMateria.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma.</p>}
              </section>

              {(sidebarExpanded.avaliacoesAula ? assessmentsPorAula : assessmentsPorAula.filter(({ lesson: l }) => selectedLesson?.id === l.id)).map(({ lesson, items }) => (
                <section key={lesson.id} className="creation-section">
                  <button
                    type="button"
                    className="creation-section-title flex items-center gap-2 w-full text-left"
                    onClick={() => setSidebarExpanded((s) => ({ ...s, avaliacoesAula: !s.avaliacoesAula }))}
                  >
                    {sidebarExpanded.avaliacoesAula ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    Avaliações da aula «{lesson.title}» (não valem nota)
                  </button>
                  <button type="button" className="creation-item creation-item-new" onClick={() => handleCreateNewAvaliacao(lesson)}>
                    + Criar nova avaliação
                  </button>
                  <ul className="creation-list">
                    {items.map((a) => (
                      <li key={a.id} className="creation-list-item">
                        <button
                          type="button"
                          className={`creation-item ${selectedAssessment?.id === a.id ? "active" : ""}`}
                          onClick={() => handleSelectAssessment(a)}
                        >
                          {a.title}
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "assessment", id: a.id, name: a.title }); }}
                          title="Deletar avaliação"
                        >
                          Deletar
                        </button>
                      </li>
                    ))}
                  </ul>
                  {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma.</p>}
                </section>
              ))}

              {selectedAssessment && (
                <section className="creation-section">
                  <button
                    type="button"
                    className="creation-section-title flex items-center gap-2 w-full text-left"
                    onClick={() => setSidebarExpanded((s) => ({ ...s, perguntas: !s.perguntas }))}
                  >
                    {sidebarExpanded.perguntas ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    Perguntas de «{selectedAssessment.title}»
                  </button>
                  <button type="button" className="creation-item creation-item-new" onClick={handleCreateNewPergunta}>
                    + Adicionar pergunta
                  </button>
                  {sidebarExpanded.perguntas && (
                  <ul className="creation-list">
                    {questions.map((q) => (
                      <li key={q.id} className="creation-list-item">
                        <button
                          type="button"
                          className={`creation-item flex-1 text-left truncate ${selectedQuestion?.id === q.id ? "active" : ""}`}
                          onClick={() => handleSelectQuestion(q)}
                        >
                          {q.text}
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "question", id: q.id, name: q.text.slice(0, 50) + (q.text.length > 50 ? "..." : "") }); }}
                          title="Deletar pergunta"
                        >
                          Deletar
                        </button>
                      </li>
                    ))}
                  </ul>
                  )}
                  {questions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma pergunta.</p>}
                </section>
              )}
            </>
          )}
        </aside>

        <main className="creation-forms">
          <CreationFormCard
            id="course"
            title={selectedCourse ? "Editar Curso" : "Criar Curso"}
            breadcrumb={<Breadcrumb course={selectedCourse} suffix={selectedCourse ? "Editar" : "Novo curso"} />}
            expanded={expandedForm === "course"}
            onToggle={handleExpandCourseForm}
          >
            <CreationCourseForm
              editCourse={selectedCourse}
              categories={categories}
              onCategoriesChange={setCategories}
              onSuccess={() => { refreshCourses(); if (selectedCourse) refreshCourseDetail(); showMsg("success", selectedCourse ? "Curso atualizado!" : "Curso criado!"); }}
              onError={(e) => showMsg("error", errMsg(e))}
              loading={loading}
              setLoading={setLoading}
            />
          </CreationFormCard>

          {selectedCourse && (
            <CreationFormCard
              id="materia"
              title={selectedModule ? "Editar Matéria" : "Criar Matéria"}
              breadcrumb={<Breadcrumb course={selectedCourse} module={selectedModule} suffix={selectedModule ? "Editar" : "Nova matéria"} />}
              expanded={expandedForm === "materia"}
              onToggle={() => setExpandedForm(expandedForm === "materia" ? null : "materia")}
            >
              <CreationMateriaForm
                courseId={selectedCourse.id}
                editModule={selectedModule}
                moduleDetail={moduleDetail}
                onSuccess={() => { refreshCourseDetail(); showMsg("success", selectedModule ? "Matéria atualizada!" : "Matéria criada!"); }}
                onError={(e) => showMsg("error", errMsg(e))}
                loading={loading}
                setLoading={setLoading}
              />
            </CreationFormCard>
          )}

          {selectedModule && (
            <>
              <CreationFormCard
                id="aula"
                title={selectedLesson ? "Editar Aula" : "Criar Aula"}
                breadcrumb={<Breadcrumb course={selectedCourse} module={selectedModule} lesson={selectedLesson} suffix={selectedLesson ? "Editar" : "Nova aula"} />}
                expanded={expandedForm === "aula"}
                onToggle={() => setExpandedForm(expandedForm === "aula" ? null : "aula")}
              >
                <CreationAulaForm
                  moduleId={selectedModule.id}
                  editLesson={selectedLesson}
                  onSuccess={() => { refreshModuleDetail(); showMsg("success", selectedLesson ? "Aula atualizada!" : "Aula criada!"); }}
                  onError={(e) => showMsg("error", errMsg(e))}
                  loading={loading}
                  setLoading={setLoading}
                />
              </CreationFormCard>

              <CreationFormCard
                id="avaliacao"
                title={selectedAssessment ? "Editar Avaliação" : "Criar Avaliação"}
                breadcrumb={
                  selectedLesson ? (
                    <Breadcrumb course={selectedCourse} module={selectedModule} lesson={selectedLesson} assessment={selectedAssessment} suffix={selectedAssessment ? "Editar" : "Nova avaliação (não vale nota)"} />
                  ) : (
                    <Breadcrumb course={selectedCourse} module={selectedModule} assessment={selectedAssessment} suffix={selectedAssessment ? "Editar" : "Nova avaliação (vale nota)"} />
                  )
                }
                expanded={expandedForm === "avaliacao"}
                onToggle={() => setExpandedForm(expandedForm === "avaliacao" ? null : "avaliacao")}
              >
                <CreationAvaliacaoForm
                  moduleId={selectedModule.id}
                  lessonId={selectedLesson?.id ?? null}
                  editAssessment={selectedAssessment}
                  onSuccess={() => { refreshModuleDetail(); showMsg("success", selectedAssessment ? "Avaliação atualizada!" : "Avaliação criada!"); }}
                  onError={(e) => showMsg("error", errMsg(e))}
                  loading={loading}
                  setLoading={setLoading}
                />
              </CreationFormCard>
            </>
          )}

          {selectedAssessment && (
            <CreationFormCard
              id="pergunta"
              title={selectedQuestion ? "Editar Pergunta" : "Adicionar Pergunta"}
              breadcrumb={<Breadcrumb course={selectedCourse} module={selectedModule} assessment={selectedAssessment} suffix={selectedQuestion ? "Editar pergunta" : "Nova pergunta"} />}
              expanded={expandedForm === "pergunta"}
              onToggle={() => setExpandedForm(expandedForm === "pergunta" ? null : "pergunta")}
            >
              <CreationPerguntaForm
                assessmentId={selectedAssessment.id}
                isModuleLevel={!selectedAssessment.lesson_id}
                editQuestion={selectedQuestion}
                onSuccess={() => { refreshAssessmentDetail(); setSelectedQuestion(null); showMsg("success", selectedQuestion ? "Pergunta atualizada!" : "Pergunta adicionada!"); }}
                onError={(e) => showMsg("error", errMsg(e))}
                loading={loading}
                setLoading={setLoading}
              />
            </CreationFormCard>
          )}
        </main>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Confirmar exclusão"
        description={deleteTarget ? `Deseja realmente excluir "${deleteTarget.name}"? Esta ação não pode ser desfeita.` : ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}

function CreationFormCard({
  id,
  title,
  breadcrumb,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  breadcrumb: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="creation-form-card">
      <button type="button" className="creation-form-header" onClick={onToggle}>
        {expanded ? <ChevronDown className="creation-form-chevron" /> : <ChevronRight className="creation-form-chevron" />}
        <span>{title}</span>
      </button>
      {expanded && (
        <div className="creation-form-body">
          {breadcrumb}
          {children}
        </div>
      )}
    </div>
  );
}

function CreationCourseForm({
  editCourse,
  categories,
  onCategoriesChange,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  editCourse: Course | null;
  categories: Category[];
  onCategoriesChange: (c: Category[]) => void;
  onSuccess: () => void;
  onError: (e: unknown) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [title, setTitle] = useState(editCourse?.title ?? "");
  const [description, setDescription] = useState(editCourse?.description ?? "");
  const [shortDescription, setShortDescription] = useState(editCourse?.short_description ?? "");
  const [difficulty, setDifficulty] = useState(editCourse?.difficulty ?? "");
  const [targetRole, setTargetRole] = useState(editCourse?.target_role ?? "");
  const [categoryId, setCategoryId] = useState<string>(editCourse?.category_id ? String(editCourse.category_id) : "");
  const [categoryInput, setCategoryInput] = useState("");
  const [featured, setFeatured] = useState(editCourse?.featured ?? false);

  useEffect(() => {
    if (editCourse) {
      setTitle(editCourse.title);
      setDescription(editCourse.description ?? "");
      setShortDescription(editCourse.short_description ?? "");
      setDifficulty(editCourse.difficulty ?? "");
      setTargetRole(editCourse.target_role ?? "");
      setCategoryId(editCourse.category_id ? String(editCourse.category_id) : "");
      setFeatured(editCourse.featured ?? false);
    } else {
      setTitle(""); setDescription(""); setShortDescription(""); setDifficulty(""); setTargetRole(""); setCategoryId(""); setCategoryInput(""); setFeatured(false);
    }
  }, [editCourse?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      let finalCategoryId: number | null = null;
      if (categoryInput.trim()) {
        const existing = categories.find((c) => c.name.toLowerCase() === categoryInput.trim().toLowerCase());
        if (existing) {
          finalCategoryId = existing.id;
        } else {
          const created = await createCategory(categoryInput.trim());
          onCategoriesChange([...categories, created]);
          finalCategoryId = created.id;
        }
      } else if (categoryId) {
        finalCategoryId = parseInt(categoryId, 10);
      }

      if (editCourse) {
        await updateCourse(editCourse.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          short_description: shortDescription.trim() || undefined,
          difficulty: difficulty || undefined,
          target_role: targetRole.trim() || undefined,
          category_id: finalCategoryId,
          featured,
        });
      } else {
        await createCourse({
          title: title.trim(),
          description: description.trim() || undefined,
          short_description: shortDescription.trim() || undefined,
          difficulty: difficulty || undefined,
          target_role: targetRole.trim() || undefined,
          category_id: finalCategoryId || undefined,
          featured,
        });
      }
      if (!editCourse) {
        setTitle(""); setDescription(""); setShortDescription(""); setDifficulty(""); setTargetRole(""); setCategoryId(""); setCategoryInput(""); setFeatured(false);
      }
      onSuccess();
    } catch (err) { onError(err); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="creation-form">
      <input placeholder="Título do Curso" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className="block text-sm font-medium mb-2">Descrição curta (exibida nos cards)</label>
      <input placeholder="Descrição curta do curso..." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
      <label className="block text-sm font-medium mb-2">Descrição completa</label>
      <WysiwygEditor value={description} onChange={setDescription} placeholder="Descrição do curso..." />
      <label className="block text-sm font-medium mb-2">Categoria</label>
      <div
        className={`rounded-lg transition-colors ${
          editCourse && !categoryId && !categoryInput.trim()
            ? "border-2 border-destructive ring-2 ring-destructive/20"
            : "border border-input"
        }`}
        title={editCourse && !categoryId && !categoryInput.trim() ? "O curso está sem categoria e não está sendo exibido no painel." : undefined}
      >
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setCategoryInput(""); }}
          className="w-full p-3 bg-transparent border-none rounded-lg focus:outline-none focus:ring-0"
        >
          <option value="">Selecionar categoria existente</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          placeholder="Ou digite para criar nova categoria"
          value={categoryInput}
          onChange={(e) => { setCategoryInput(e.target.value); setCategoryId(""); }}
          className="w-full p-3 border-t border-input bg-transparent rounded-b-lg focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="">Dificuldade</option>
        <option value="Iniciante">Iniciante</option>
        <option value="Intermediário">Intermediário</option>
        <option value="Avançado">Avançado</option>
      </select>
      <input placeholder="Categoria de Funcionários Alvo" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
      <label className="flex items-center gap-2 mb-3 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destacar curso
      </label>
      <button type="submit" disabled={loading}>{loading ? (editCourse ? "Salvando..." : "Criando...") : (editCourse ? "Salvar alterações" : "Criar Curso")}</button>
    </form>
  );
}

function CreationMateriaForm({
  courseId,
  editModule,
  moduleDetail,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  courseId: number;
  editModule: Module | null;
  moduleDetail: Module | null;
  onSuccess: () => void;
  onError: (e: unknown) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [title, setTitle] = useState(editModule?.title ?? "");
  const [description, setDescription] = useState(editModule?.description ?? moduleDetail?.description ?? "");
  const [position, setPosition] = useState(editModule?.position ?? moduleDetail?.position ?? "");
  const [content, setContent] = useState(editModule?.content ?? moduleDetail?.content ?? "");

  useEffect(() => {
    if (editModule || moduleDetail) {
      const m = moduleDetail ?? editModule;
      if (m) {
        setTitle(m.title);
        setDescription(m.description ?? "");
        setPosition(m.position != null ? String(m.position) : "");
        setContent(m.content ?? "");
      }
    } else {
      setTitle(""); setDescription(""); setPosition(""); setContent("");
    }
  }, [editModule?.id, moduleDetail?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (editModule) {
        await updateModule(editModule.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          position: position ? parseInt(position, 10) : undefined,
          content: content.trim() || undefined,
        });
      } else {
        await createModule({
          course_id: courseId,
          title: title.trim(),
          description: description.trim() || undefined,
          position: position ? parseInt(position, 10) : undefined,
          content: content.trim() || undefined,
        });
      }
      if (!editModule) {
        setTitle(""); setDescription(""); setPosition(""); setContent("");
      }
      onSuccess();
    } catch (err) { onError(err); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="creation-form">
      <input placeholder="Título da Matéria" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className="block text-sm font-medium mb-2">Descrição</label>
      <WysiwygEditor value={description} onChange={setDescription} placeholder="Descrição da matéria..." />
      <label className="block text-sm font-medium mb-2">Posição no curso</label>
      <input placeholder="Posição (0, 1, 2...)" type="number" min={0} value={position} onChange={(e) => setPosition(e.target.value)} />
      <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Matéria</label>
      <textarea placeholder="Conteúdo..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px]" />
      <button type="submit" disabled={loading}>{loading ? (editModule ? "Salvando..." : "Criando...") : (editModule ? "Salvar alterações" : "Criar Matéria")}</button>
    </form>
  );
}

function CreationAulaForm({
  moduleId,
  editLesson,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  moduleId: number;
  editLesson: Lesson | null;
  onSuccess: () => void;
  onError: (e: unknown) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [title, setTitle] = useState(editLesson?.title ?? "");
  const [position, setPosition] = useState(editLesson?.position != null ? String(editLesson.position) : "");
  const [content, setContent] = useState(editLesson?.content ?? editLesson?.description ?? "");

  useEffect(() => {
    if (editLesson) {
      setTitle(editLesson.title);
      setPosition(editLesson.position != null ? String(editLesson.position) : "");
      setContent(editLesson.content ?? editLesson.description ?? "");
    } else {
      setTitle(""); setPosition(""); setContent("");
    }
  }, [editLesson?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (editLesson) {
        await updateLesson(editLesson.id, {
          title: title.trim(),
          position: position ? parseInt(position, 10) : undefined,
          content: content.trim() || undefined,
        });
      } else {
        await createLesson({
          module_id: moduleId,
          title: title.trim(),
          position: position ? parseInt(position, 10) : undefined,
          content: content.trim() || undefined,
        });
      }
      if (!editLesson) {
        setTitle(""); setPosition(""); setContent("");
      }
      onSuccess();
    } catch (err) { onError(err); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="creation-form">
      <input placeholder="Título da Aula" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className="block text-sm font-medium mb-2">Posição na matéria</label>
      <input placeholder="Posição (0, 1, 2...)" type="number" min={0} value={position} onChange={(e) => setPosition(e.target.value)} />
      <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Aula</label>
      <WysiwygEditor value={content} onChange={setContent} placeholder="Conteúdo da aula..." />
      <button type="submit" disabled={loading}>{loading ? (editLesson ? "Salvando..." : "Criando...") : (editLesson ? "Salvar alterações" : "Criar Aula")}</button>
    </form>
  );
}

function CreationAvaliacaoForm({
  moduleId,
  lessonId,
  editAssessment,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  moduleId: number;
  lessonId: number | null;
  editAssessment: Assessment | null;
  onSuccess: () => void;
  onError: (e: unknown) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const isModuleLevel = !lessonId;
  const [title, setTitle] = useState(editAssessment?.title ?? "");
  const [maxScore, setMaxScore] = useState(editAssessment?.max_score != null ? String(editAssessment.max_score) : "");
  const [minScore, setMinScore] = useState(editAssessment?.min_score != null ? String(editAssessment.min_score) : "");
  const [position, setPosition] = useState(editAssessment?.position != null ? String(editAssessment.position) : "");

  useEffect(() => {
    if (editAssessment) {
      setTitle(editAssessment.title);
      setMaxScore(editAssessment.max_score != null ? String(editAssessment.max_score) : "");
      setMinScore(editAssessment.min_score != null ? String(editAssessment.min_score) : "");
      setPosition(editAssessment.position != null ? String(editAssessment.position) : "");
    } else {
      setTitle(""); setMaxScore(""); setMinScore(""); setPosition("");
    }
  }, [editAssessment?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (editAssessment) {
        await updateAssessment(editAssessment.id, {
          title: title.trim(),
          max_score: maxScore ? parseInt(maxScore, 10) : undefined,
          min_score: minScore ? parseInt(minScore, 10) : undefined,
          position: position ? parseInt(position, 10) : undefined,
        });
      } else {
        await createAssessment({
          module_id: moduleId,
          lesson_id: lessonId,
          title: title.trim(),
          max_score: isModuleLevel && maxScore ? parseInt(maxScore, 10) : undefined,
          min_score: isModuleLevel && minScore ? parseInt(minScore, 10) : undefined,
          position: position ? parseInt(position, 10) : undefined,
        });
      }
      if (!editAssessment) {
        setTitle(""); setMaxScore(""); setMinScore(""); setPosition("");
      }
      onSuccess();
    } catch (err) { onError(err); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="creation-form">
      <input placeholder="Título da Avaliação" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className="block text-sm font-medium mb-2">Posição na matéria</label>
      <input placeholder="Posição (0, 1, 2...)" type="number" min={0} value={position} onChange={(e) => setPosition(e.target.value)} />
      {isModuleLevel && (
        <>
          <label className="block text-sm font-medium mb-2">Nota máxima</label>
          <input placeholder="Nota máxima" type="number" min={0} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
          <label className="block text-sm font-medium mb-2">Nota mínima para aprovação</label>
          <input placeholder="Nota mínima" type="number" min={0} value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </>
      )}
      <p className="text-sm text-muted-foreground mb-2">
        {lessonId ? "Avaliação na aula: não vale nota." : "Avaliação na matéria: vale nota."}
      </p>
      <button type="submit" disabled={loading}>{loading ? (editAssessment ? "Salvando..." : "Criando...") : (editAssessment ? "Salvar alterações" : "Criar Avaliação")}</button>
    </form>
  );
}

type TipoResposta = "texto" | "alternativas";

function CreationPerguntaForm({ assessmentId, isModuleLevel, editQuestion, onSuccess, onError, loading, setLoading }: { assessmentId: number; isModuleLevel: boolean; editQuestion: Question | null; onSuccess: () => void; onError: (e: unknown) => void; loading: boolean; setLoading: (v: boolean) => void }) {
  const [pergunta, setPergunta] = useState(editQuestion?.text ?? "");
  const [score, setScore] = useState(editQuestion?.score != null ? String(editQuestion.score) : "");
  const [tipoResposta, setTipoResposta] = useState<TipoResposta>(editQuestion?.answer_text ? "texto" : "alternativas");
  const [answerText, setAnswerText] = useState(editQuestion?.answer_text ?? "");
  const [multiplaEscolha, setMultiplaEscolha] = useState(editQuestion?.is_multiple_choice ?? false);
  const [alternativas, setAlternativas] = useState(() => {
    const opts = editQuestion?.options ?? [];
    const letters = ["A", "B", "C", "D"];
    return letters.map((letra, i) => {
      const o = opts.find((x) => x.label === letra);
      return { letra, texto: o?.text ?? "", correta: o?.is_correct ?? false };
    });
  });

  useEffect(() => {
    if (editQuestion) {
      setPergunta(editQuestion.text);
      setScore(editQuestion.score != null ? String(editQuestion.score) : "");
      setTipoResposta(editQuestion.answer_text ? "texto" : "alternativas");
      setAnswerText(editQuestion.answer_text ?? "");
      setMultiplaEscolha(editQuestion.is_multiple_choice ?? false);
      const opts = editQuestion.options ?? [];
      const letters = ["A", "B", "C", "D"];
      setAlternativas(letters.map((letra, i) => {
        const o = opts.find((x) => x.label === letra);
        return { letra, texto: o?.text ?? "", correta: o?.is_correct ?? false };
      }));
    } else {
      setPergunta("");
      setScore("");
      setTipoResposta("alternativas");
      setAnswerText("");
      setMultiplaEscolha(false);
      setAlternativas([
        { letra: "A", texto: "", correta: false },
        { letra: "B", texto: "", correta: false },
        { letra: "C", texto: "", correta: false },
        { letra: "D", texto: "", correta: false },
      ]);
    }
  }, [editQuestion?.id]);

  const handleAlternativaChange = (index: number, value: string) => {
    const novas = [...alternativas];
    novas[index].texto = value;
    setAlternativas(novas);
  };

  const marcarCorreta = (index: number) => {
    if (multiplaEscolha) {
      const novas = [...alternativas];
      novas[index].correta = !novas[index].correta;
      setAlternativas(novas);
    } else {
      setAlternativas(alternativas.map((alt, i) => ({ ...alt, correta: i === index })));
    }
  };

  async function salvarPergunta(e: React.FormEvent) {
    e.preventDefault();
    if (!pergunta.trim()) return;
    const comTexto = alternativas.filter((a) => a.texto.trim());
    const temAlternativas = comTexto.length >= 2;
    const temCorreta = alternativas.some((a) => a.correta);
    const temRespostaTexto = answerText.trim().length > 0;

    if (tipoResposta === "texto") {
      if (!temRespostaTexto) {
        onError(new Error("Digite a resposta esperada em texto"));
        return;
      }
    } else {
      if (!temAlternativas) {
        onError(new Error("Adicione pelo menos 2 alternativas"));
        return;
      }
      if (!temCorreta) {
        onError(new Error("Marque a alternativa correta"));
        return;
      }
    }

    setLoading(true);
    try {
      if (editQuestion) {
        await updateQuestion(editQuestion.id, {
          text: pergunta.trim(),
          answer_text: tipoResposta === "texto" ? answerText.trim() : null,
          score: isModuleLevel && score ? parseInt(score, 10) : undefined,
        });
        if (temAlternativas && editQuestion.options) {
          for (let i = 0; i < alternativas.length; i++) {
            const alt = alternativas[i];
            const existing = editQuestion.options.find((o) => o.label === alt.letra);
            if (alt.texto.trim()) {
              if (existing) {
                await updateOption(existing.id, { text: alt.texto.trim(), is_correct: alt.correta });
              } else {
                await createOption({
                  question_id: editQuestion.id,
                  label: alt.letra,
                  text: alt.texto.trim(),
                  is_correct: alt.correta,
                });
              }
            }
          }
        }
      } else {
        const q = await createQuestion({
          assessment_id: assessmentId,
          text: pergunta.trim(),
          answer_text: tipoResposta === "texto" ? answerText.trim() : undefined,
          is_multiple_choice: multiplaEscolha && temAlternativas,
          score: isModuleLevel && score ? parseInt(score, 10) : undefined,
        });
        if (temAlternativas) {
          for (const alt of alternativas) {
            if (alt.texto.trim()) {
              await createOption({
                question_id: q.id,
                label: alt.letra,
                text: alt.texto.trim(),
                is_correct: alt.correta,
              });
            }
          }
        }
        setPergunta("");
        setScore("");
        setAnswerText("");
        setMultiplaEscolha(false);
        setAlternativas([
          { letra: "A", texto: "", correta: false },
          { letra: "B", texto: "", correta: false },
          { letra: "C", texto: "", correta: false },
          { letra: "D", texto: "", correta: false },
        ]);
      }
      onSuccess();
    } catch (err) { onError(err); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={salvarPergunta} className="creation-form avaliacao-card">
      <label className="block text-sm font-medium mb-2">Pergunta</label>
      <textarea placeholder="Digite a pergunta..." value={pergunta} onChange={(e) => setPergunta(e.target.value)} required className="pergunta-input" />
      {isModuleLevel && (
        <>
          <label className="block text-sm font-medium mb-2 mt-2">Nota da pergunta</label>
          <input placeholder="Pontos desta pergunta" type="number" min={0} value={score} onChange={(e) => setScore(e.target.value)} />
        </>
      )}

      <div className="tipo-resposta-block">
        <span className="block text-sm font-medium mb-2">Tipo de resposta</span>
        <div className="tipo-resposta-options">
          <label className="tipo-resposta-option">
            <input type="radio" name="tipoResposta" checked={tipoResposta === "alternativas"} onChange={() => setTipoResposta("alternativas")} />
            Alternativas (A, B, C, D)
          </label>
          <label className="tipo-resposta-option">
            <input type="radio" name="tipoResposta" checked={tipoResposta === "texto"} onChange={() => setTipoResposta("texto")} />
            Resposta em texto
          </label>
        </div>
      </div>

      {tipoResposta === "texto" ? (
        <div className="answer-text-block">
          <label className="block text-sm font-medium mb-2">Resposta esperada</label>
          <textarea
            placeholder="Digite a resposta esperada..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="answer-text-input"
            rows={3}
          />
        </div>
      ) : (
        <>
          <label className="flex items-center gap-2 mb-2 text-sm mt-4 multipla-label">
            <input type="checkbox" checked={multiplaEscolha} onChange={(e) => setMultiplaEscolha(e.target.checked)} className="multipla-check" /> Permitir múltiplas escolhas
          </label>
          <div className="alternativas-grid">
            {alternativas.map((alt, index) => (
              <div key={alt.letra} className="alternativa-item">
                <span className="letra">{alt.letra}.</span>
                <div className="alternativa-input-wrap">
                  <input
                    type="text"
                    placeholder={`Texto da alternativa ${alt.letra}...`}
                    value={alt.texto}
                    onChange={(e) => handleAlternativaChange(index, e.target.value)}
                    className="alternativa-input"
                  />
                  <label className="correta-label">
                    <input type={multiplaEscolha ? "checkbox" : "radio"} name="correta" checked={alt.correta} onChange={() => marcarCorreta(index)} className="correta-check" />
                    Correta
                  </label>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button type="submit" className="salvar-btn" disabled={loading}>{loading ? "Salvando..." : (editQuestion ? "Salvar alterações" : "Adicionar Pergunta")}</button>
    </form>
  );
}
