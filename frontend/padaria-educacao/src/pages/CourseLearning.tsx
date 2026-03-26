import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CourseSidebar from "@/components/course/CourseSidebar";
import LessonContent from "@/components/course/LessonContent";
import AssessmentComponent from "@/components/course/Assessment";
import { getCourse, completeLesson, completeAssessment, enrollInCourse, type CourseWithProgress } from "@/services/course.service";
import { reportLeftIncomplete } from "@/services/notification.service";
import { setDocumentTitle } from "@/config/appConfig";
import type { Course, Module, Lesson, Assessment } from "@/types";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

type CourseData = CourseWithProgress & { modules?: Module[] };

export default function CourseLearning() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(false);
  const [activeContent, setActiveContent] = useState<string>("");

  // Refs com sempre o valor mais recente — sem entrar em dependency arrays de effects
  const courseRef = useRef<CourseData | null>(null);
  const activeContentRef = useRef<string>("");
  const courseIdRef = useRef<string | undefined>(id);
  // Aulas cuja conclusão foi enviada à API mas ainda não retornou
  const pendingLessonIds = useRef<Set<number>>(new Set());

  // Mantém os refs sincronizados a cada render
  courseRef.current = course;
  activeContentRef.current = activeContent;
  courseIdRef.current = id;

  useEffect(() => {
    setDocumentTitle(id ? `Curso ${id}` : "Curso");
  }, [id]);

  function fetchCourse() {
    if (!id) return;
    setLoading(true);
    setError(false);
    getCourse(id)
      .then((data) => {
        setCourse(data);
        if (data.is_enrolled && data.modules?.length) {
          setActiveContent(getFirstContentKey(data));
        }
        setError(false);
      })
      .catch(() => {
        setCourse(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Reporta ao servidor SOMENTE quando o usuário sai da página do curso (unmount).
  // Dependências vazias [] garantem que o cleanup nunca roda ao trocar de aula/avaliação.
  // Todos os valores necessários são lidos via refs para evitar closures desatualizados.
  useEffect(() => {
    return () => {
      const c = courseRef.current;
      const content = activeContentRef.current;
      const courseId = courseIdRef.current;
      if (!c?.is_enrolled || !content || !courseId) return;
      const [type, idStr] = content.split("-");
      const itemId = parseInt(idStr, 10);
      const completedLessons = c.completed_lesson_ids ?? [];
      const completedAssess = c.completed_assessment_ids ?? [];
      const isIncomplete =
        (type === "lesson" && !completedLessons.includes(itemId) && !pendingLessonIds.current.has(itemId)) ||
        (type === "assessment" && !completedAssess.includes(itemId));
      if (isIncomplete) {
        const itemName = type === "lesson"
          ? findLesson(c, itemId)?.title
          : findAssessment(c, itemId)?.title;
        reportLeftIncomplete({
          context: `Você saiu sem concluir ${type === "lesson" ? "a aula" : "a avaliação"}: ${itemName ?? "conteúdo"}`,
          course_id: c.id,
        }).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = cleanup roda APENAS no unmount (usuário sai da página do curso)

  async function handleIniciarCurso() {
    if (!id || !course) return;
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setLoading(true);
      const data = await getCourse(id);
      setCourse(data);
      if (data.modules?.length) {
        setActiveContent(getFirstContentKey(data));
      }
    } catch {
      /* ignore */
    } finally {
      setEnrolling(false);
      setLoading(false);
    }
  }

  function getFirstContentKey(c: CourseData): string {
    const mods = getUnlockedModules(c);
    for (const m of mods) {
      const lessons = (m.lessons ?? []).map((l) => ({ type: "lesson" as const, id: l.id, pos: l.position ?? 0 }));
      const assessments = (m.assessments ?? []).map((a) => ({ type: "assessment" as const, id: a.id, pos: a.position ?? 0 }));
      const items = [...lessons, ...assessments].sort((a, b) => a.pos - b.pos);
      if (items.length > 0) return `${items[0].type}-${items[0].id}`;
    }
    return "";
  }

  function getUnlockedModules(c: CourseData): Module[] {
    const mods = (c.modules ?? []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const completed = c.completed_lesson_ids ?? [];
    const completedAssess = c.completed_assessment_ids ?? [];
    const unlocked: Module[] = [];
    let canUnlockNext = true;
    for (const m of mods) {
      if (canUnlockNext) {
        unlocked.push(m);
        canUnlockNext = isModuleComplete(m, completed, completedAssess);
      } else {
        break;
      }
    }
    return unlocked;
  }

  function isModuleComplete(m: Module, completed: number[], completedAssess: number[]): boolean {
    const lessons = m.lessons ?? [];
    const assessments = m.assessments ?? [];
    return lessons.every((l) => completed.includes(l.id)) && assessments.every((a) => completedAssess.includes(a.id));
  }

  async function handleLessonViewed(lessonId: number) {
    if (!id || !course) return;
    // Marca como pendente antes da chamada: evita falso "saiu sem terminar"
    // caso o usuário navegue para outra aula antes da API responder
    pendingLessonIds.current.add(lessonId);
    try {
      await completeLesson(id, lessonId);
      setCourse((prev) => {
        if (!prev) return prev;
        const ids = prev.completed_lesson_ids ?? [];
        if (ids.includes(lessonId)) return prev;
        const next = { ...prev, completed_lesson_ids: [...ids, lessonId] };
        const total = countTotalItems(prev);
        const completed = (next.completed_lesson_ids?.length ?? 0) + (next.completed_assessment_ids?.length ?? 0);
        next.user_progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return next;
      });
    } catch {
      // Em caso de erro, remove da lista de pendentes para não suprimir um reporte legítimo
      pendingLessonIds.current.delete(lessonId);
    }
  }

  async function handleAssessmentSubmit(assessmentId: number, score: number) {
    if (!id || !course) return;
    try {
      const res = await completeAssessment(id, assessmentId, score);
      setCourse((prev) => {
        if (!prev) return prev;
        const ids = prev.completed_assessment_ids ?? [];
        if (ids.includes(assessmentId)) return prev;
        return {
          ...prev,
          completed_assessment_ids: [...ids, assessmentId],
          user_progress: res.progress,
        };
      });
    } catch {
      /* ignore */
    }
  }

  function countTotalItems(c: CourseData): number {
    let n = 0;
    (c.modules ?? []).forEach((m) => {
      n += (m.lessons ?? []).length + (m.assessments ?? []).length;
    });
    return n;
  }

  useEffect(() => {
    if (!course || !id || !activeContent.startsWith("lesson-")) return;
    const lessonId = parseInt(activeContent.replace("lesson-", ""), 10);
    if ((course.completed_lesson_ids ?? []).includes(lessonId)) return;
    handleLessonViewed(lessonId);
  }, [activeContent, course?.id]);

  function renderContent() {
    if (!course || !activeContent) return null;
    const [type, idStr] = activeContent.split("-");
    const itemId = parseInt(idStr, 10);

    if (type === "lesson") {
      const lesson = findLesson(course, itemId);
      if (!lesson) return null;
      return (
        <LessonContent title={lesson.title} content={lesson.content || "Sem conteúdo."} />
      );
    }

    if (type === "assessment") {
      const assessment = findAssessment(course, itemId);
      if (!assessment) return null;
      const isCompleted = (course.completed_assessment_ids ?? []).includes(assessment.id);
      return (
        <AssessmentComponent
          key={activeContent}
          assessmentId={assessment.id}
          title={assessment.title}
          questions={assessment.questions ?? []}
          maxScore={assessment.max_score}
          minScore={assessment.min_score}
          isCompleted={isCompleted}
          onSubmit={(score) => handleAssessmentSubmit(assessment.id, score)}
        />
      );
    }

    return null;
  }

  const modules = course?.modules ?? [];
  const unlockedModules = course ? getUnlockedModules(course) : [];

  // Tela de introdução antes de matricular
  if (!loading && course && !course.is_enrolled) {
    return (
      <PageLoader loading={false}>
        <div className="course-container">
          <div className="content-panel flex flex-col max-w-3xl mx-auto">
            <div className="mb-6">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                ← Voltar ao Dashboard
              </Link>
            </div>
            <div className="course-intro">
              <h1 className="text-2xl font-bold text-foreground mb-4">{course.title}</h1>
              {course.description ? (
                <div
                  className="course-intro-description prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              ) : (
                <p className="text-muted-foreground">Este curso não possui descrição.</p>
              )}
              <div className="course-intro-actions mt-8 flex gap-4">
                <Link to="/dashboard" className="btn-secondary">
                  Voltar ao Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleIniciarCurso}
                  disabled={enrolling}
                  className="btn-primary"
                >
                  {enrolling ? "Enviando..." : "Iniciar Curso"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLoader>
    );
  }

  return (
    <PageLoader loading={loading}>
      {!loading && !course && (
        <div className="course-container">
          <div className="content-panel flex flex-col items-center justify-center">
            <EmptyState
              variant="error"
              title={error ? "Não foi possível carregar o curso" : "Curso não encontrado"}
              description={error ? "Verifique sua conexão e tente novamente." : "O curso solicitado não existe ou foi removido."}
              onRetry={error ? fetchCourse : undefined}
              retryLabel="Tentar novamente"
            />
            <Link to="/dashboard" className="mt-4 text-primary hover:underline text-sm">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      )}
      {course && (modules.length === 0 || !activeContent) && course.is_enrolled && (
        <div className="course-container">
          <CourseSidebar
            courseId={id || ""}
            courseTitle={course.title}
            modules={unlockedModules}
            userProgress={course.user_progress ?? 0}
            completedLessonIds={course.completed_lesson_ids ?? []}
            completedAssessmentIds={course.completed_assessment_ids ?? []}
            activeContent=""
            setActiveContent={() => {}}
          />
          <div className="content-panel">
            <div className="mb-6">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                ← Voltar ao Dashboard
              </Link>
            </div>
            <p className="text-muted-foreground">Este curso ainda não possui conteúdo.</p>
          </div>
        </div>
      )}
      {course && modules.length > 0 && activeContent && course.is_enrolled && (
        <div className="course-container">
          <CourseSidebar
            courseId={id || ""}
            courseTitle={course.title}
            modules={unlockedModules}
            userProgress={course.user_progress ?? 0}
            completedLessonIds={course.completed_lesson_ids ?? []}
            completedAssessmentIds={course.completed_assessment_ids ?? []}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
          />
          <div className="content-panel">
            <div className="mb-6">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                ← Voltar ao Dashboard
              </Link>
            </div>
            {renderContent()}
          </div>
        </div>
      )}
    </PageLoader>
  );
}

function findLesson(course: CourseData, lessonId: number): Lesson | null {
  for (const m of course.modules ?? []) {
    const found = (m.lessons ?? []).find((l) => l.id === lessonId);
    if (found) return found;
  }
  return null;
}

function findAssessment(course: CourseData, assessmentId: number): Assessment | null {
  for (const m of course.modules ?? []) {
    const found = (m.assessments ?? []).find((a) => a.id === assessmentId);
    if (found) return found;
  }
  return null;
}
