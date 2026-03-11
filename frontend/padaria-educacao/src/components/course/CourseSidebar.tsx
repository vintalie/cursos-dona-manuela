interface CourseSidebarProps {
  courseId: string;
  activeContent: string;
  setActiveContent: (value: "lesson-1" | "lesson-2" | "assessment") => void;
}

export default function CourseSidebar({ courseId, activeContent, setActiveContent }: CourseSidebarProps) {
  return (
    <aside className="course-sidebar">
      <h2 className="sidebar-title">Curso #{courseId}</h2>
      <div className="sidebar-section">
        <h3>Matéria 1</h3>
        <button className={activeContent === "lesson-1" ? "active" : ""} onClick={() => setActiveContent("lesson-1")}>
          Aula 1
        </button>
        <button className={activeContent === "lesson-2" ? "active" : ""} onClick={() => setActiveContent("lesson-2")}>
          Aula 2
        </button>
        <button className={activeContent === "assessment" ? "active" : ""} onClick={() => setActiveContent("assessment")}>
          Avaliação Final
        </button>
      </div>
    </aside>
  );
}
