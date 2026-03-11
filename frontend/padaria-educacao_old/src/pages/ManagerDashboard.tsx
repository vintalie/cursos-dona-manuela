import { useState } from "react";

import CreateAula from "../components/CreateAula";
import CreateMateria from "../components/CreateMateria";
import CreateCourse from "../components/CreateCourse";
import CreateAvaliacao from "../components/CreateAvaliacao";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  return (
      <div className="dashboard">
        <h2>Painel do Gerente</h2>

        {/* TABS */}
        <div className="manager-tabs">
          <button onClick={() => setActiveTab("courses")}>Cursos</button>
          <button onClick={() => setActiveTab("materias")}>Matérias</button>
          <button onClick={() => setActiveTab("aulas")}>Aulas</button>
          <button onClick={() => setActiveTab("avaliacoes")}>Avaliações</button>
        </div>

        {/* CONTEÚDO */}
        {activeTab === "courses" && <CreateCourse />}
        {activeTab === "materias" && <CreateMateria />}
        {activeTab === "aulas" && <CreateAula />}
        {activeTab === "avaliacoes" && <CreateAvaliacao />}
      </div>
  );
}