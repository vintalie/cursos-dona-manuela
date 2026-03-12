import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Module, Lesson, Assessment } from "@/types";

interface CourseSidebarProps {
  courseId: string;
  courseTitle: string;
  modules: Module[];
  userProgress?: number;
  completedLessonIds?: number[];
  completedAssessmentIds?: number[];
  activeContent: string;
  setActiveContent: (key: string) => void;
}

export default function CourseSidebar({
  courseTitle,
  modules,
  userProgress = 0,
  completedLessonIds = [],
  completedAssessmentIds = [],
  activeContent,
  setActiveContent,
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    modules.forEach((m, i) => { init[m.id] = i === 0; });
    return init;
  });

  const toggleModule = (modId: number) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  return (
    <aside className="course-sidebar">
      <h2 className="sidebar-title">{courseTitle}</h2>
      <div className="progress-bar-container mb-4">
        <div className="progress-bar" style={{ width: `${userProgress}%` }} />
        <span className="progress-text">{userProgress}% concluído</span>
      </div>
      <div className="sidebar-section">
        {modules.map((mod) => {
          const isExpanded = expandedModules[mod.id] ?? true;
          const lessons = mod.lessons ?? [];
          const assessments = mod.assessments ?? [];
          const [activeType, activeId] = activeContent.split("-");
          const activeLessonId = activeType === "lesson" ? parseInt(activeId, 10) : null;
          const activeAssessmentId = activeType === "assessment" ? parseInt(activeId, 10) : null;
          const showOnlySelected = !isExpanded && (lessons.length > 1 || assessments.length > 1);
          const visibleLessons = showOnlySelected && activeLessonId
            ? lessons.filter((l) => l.id === activeLessonId)
            : lessons;
          const visibleAssessments = showOnlySelected && activeAssessmentId
            ? assessments.filter((a) => a.id === activeAssessmentId)
            : assessments;

          const modComplete = (mod.lessons ?? []).every((l) => completedLessonIds.includes(l.id))
            && (mod.assessments ?? []).every((a) => completedAssessmentIds.includes(a.id));

          return (
            <div key={mod.id} className={`sidebar-module ${modComplete ? "sidebar-module-completed" : ""}`}>
              <button
                type="button"
                className={`sidebar-module-header ${modComplete ? "completed-module" : ""}`}
                onClick={() => toggleModule(mod.id)}
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                {mod.title}
              </button>
              {(isExpanded || visibleLessons.length > 0 || visibleAssessments.length > 0) ? (
                <>
                  {(() => {
                    const lessonItems = visibleLessons.map((l: Lesson) => ({ type: "lesson" as const, item: l, pos: l.position ?? 0 }));
                    const assessItems = visibleAssessments.map((a: Assessment) => ({ type: "assessment" as const, item: a, pos: a.position ?? 0 }));
                    const sorted = [...lessonItems, ...assessItems].sort((a, b) => a.pos - b.pos);
                    return sorted.map(({ type, item }) => {
                      if (type === "lesson") {
                        const lesson = item as Lesson;
                        const key = `lesson-${lesson.id}`;
                        const done = completedLessonIds.includes(lesson.id);
                        return (
                          <button
                            key={key}
                            className={`sidebar-item ${activeContent === key ? "active" : ""} ${done ? "completed" : ""}`}
                            onClick={() => setActiveContent(key)}
                          >
                            {done && "✓ "}Aula: {lesson.title}
                          </button>
                        );
                      }
                      const assessment = item as Assessment;
                      const key = `assessment-${assessment.id}`;
                      const done = completedAssessmentIds.includes(assessment.id);
                      return (
                        <button
                          key={key}
                          className={`sidebar-item ${activeContent === key ? "active" : ""} ${done ? "completed" : ""}`}
                          onClick={() => setActiveContent(key)}
                        >
                          {done && "✓ "}Avaliação: {assessment.title}
                        </button>
                      );
                    });
                  })()}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
