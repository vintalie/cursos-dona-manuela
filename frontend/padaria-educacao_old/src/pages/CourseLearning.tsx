import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Assessment from "../components/Assessment";
import LessonContent from "../components/LessonContent";
import "../styles/course.css";

type ContentType = "lesson-1" | "lesson-2" | "assessment";

export default function CourseLearning() {
  const [activeContent, setActiveContent] = useState<ContentType>("lesson-1");

  const renderContent = () => {
    switch (activeContent) {
      case "lesson-1":
        return (
          <LessonContent
            title="Aula 1 - Conceitos Básicos de Higiene"
            content={`
A higiene na manipulação de alimentos é essencial para evitar contaminações.

Boas práticas incluem:
• Lavar as mãos corretamente
• Utilizar touca e avental
• Manter utensílios limpos
• Evitar contato com superfícies sujas

A segurança alimentar começa com você.
            `}
          />
        );

      case "lesson-2":
        return (
          <LessonContent
            title="Aula 2 - Contaminação Cruzada"
            content={`
A contaminação cruzada ocorre quando microrganismos são transferidos de um alimento para outro.

Prevenção:
• Separar alimentos crus e cozidos
• Utilizar tábuas diferentes
• Higienizar superfícies após uso
• Armazenar corretamente na geladeira
            `}
          />
        );

      case "assessment":
        return <Assessment />;

      default:
        return null;
    }
  };

  return (
    <div className="course-container">
      <Sidebar
        activeContent={activeContent}
        setActiveContent={setActiveContent}
      />

      <div className="content-panel">
        {renderContent()}
      </div>
    </div>
  );
}