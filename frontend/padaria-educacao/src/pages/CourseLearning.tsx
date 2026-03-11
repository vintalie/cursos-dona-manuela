import { useState } from "react";
import { useParams } from "react-router-dom";
import CourseSidebar from "@/components/course/CourseSidebar";
import LessonContent from "@/components/course/LessonContent";
import AssessmentComponent from "@/components/course/Assessment";

type ContentType = "lesson-1" | "lesson-2" | "assessment";

export default function CourseLearning() {
  const { id } = useParams<{ id: string }>();
  const [activeContent, setActiveContent] = useState<ContentType>("lesson-1");

  const renderContent = () => {
    switch (activeContent) {
      case "lesson-1":
        return (
          <LessonContent
            title="Aula 1 - Conceitos Básicos de Higiene"
            content={`A higiene na manipulação de alimentos é essencial para evitar contaminações.

Boas práticas incluem:
• Lavar as mãos corretamente
• Utilizar touca e avental
• Manter utensílios limpos
• Evitar contato com superfícies sujas

A segurança alimentar começa com você.`}
          />
        );
      case "lesson-2":
        return (
          <LessonContent
            title="Aula 2 - Contaminação Cruzada"
            content={`A contaminação cruzada ocorre quando microrganismos são transferidos de um alimento para outro.

Prevenção:
• Separar alimentos crus e cozidos
• Utilizar tábuas diferentes
• Higienizar superfícies após uso
• Armazenar corretamente na geladeira`}
          />
        );
      case "assessment":
        return <AssessmentComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="course-container">
      <CourseSidebar
        courseId={id || "1"}
        activeContent={activeContent}
        setActiveContent={setActiveContent}
      />
      <div className="content-panel">
        {renderContent()}
      </div>
    </div>
  );
}
