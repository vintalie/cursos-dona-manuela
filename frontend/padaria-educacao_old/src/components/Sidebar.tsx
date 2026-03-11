import React from "react";

interface SidebarProps {
  activeContent: string;
  setActiveContent: (value: string) => void;
}

export default function Sidebar({
  activeContent,
  setActiveContent,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Higiene na Manipulação</h2>

      <div className="sidebar-section">
        <h3>Matéria 1</h3>

        <button
          className={activeContent === "lesson-1" ? "active" : ""}
          onClick={() => setActiveContent("lesson-1")}
        >
          Aula 1
        </button>

        <button
          className={activeContent === "lesson-2" ? "active" : ""}
          onClick={() => setActiveContent("lesson-2")}
        >
          Aula 2
        </button>

        <button
          className={activeContent === "assessment" ? "active" : ""}
          onClick={() => setActiveContent("assessment")}
        >
          Avaliação Final
        </button>
      </div>
    </aside>
  );
}