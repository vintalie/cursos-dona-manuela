import { useEffect, useState } from "react";
import CreateCourse from "@/components/forms/CreateCourse";
import CreateMateria from "@/components/forms/CreateMateria";
import CreateAula from "@/components/forms/CreateAula";
import CreateAvaliacao from "@/components/forms/CreateAvaliacao";
import { setDocumentTitle } from "@/config/appConfig";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    setDocumentTitle("Painel do Gerente");
  }, []);

  const tabs = [
    { key: "courses", label: "Cursos" },
    { key: "materias", label: "Matérias" },
    { key: "aulas", label: "Aulas" },
    { key: "avaliacoes", label: "Avaliações" },
  ];

  return (
    <div className="dashboard">
      <h2>Painel do Gerente</h2>

      <div className="manager-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "courses" && <CreateCourse />}
      {activeTab === "materias" && <CreateMateria />}
      {activeTab === "aulas" && <CreateAula />}
      {activeTab === "avaliacoes" && <CreateAvaliacao />}
    </div>
  );
}
