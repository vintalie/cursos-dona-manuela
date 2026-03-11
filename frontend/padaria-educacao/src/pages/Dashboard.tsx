import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setDocumentTitle } from "@/config/appConfig";

export default function Dashboard() {
  useEffect(() => {
    setDocumentTitle("Dashboard");
  }, []);

  return (
    <div className="dashboard">
      <h2>Bem-vindo ao Sistema Educacional</h2>

      <section>
        <h3>Cursos em Destaque</h3>
        <div className="cards-grid">
          <div className="card">
            <h4>Higiene na Manipulação</h4>
            <p>Aprenda boas práticas sanitárias.</p>
            <Link to="/curso/1" className="course-button">Começar</Link>
          </div>
          <div className="card">
            <h4>Atendimento ao Cliente</h4>
            <p>Melhore sua comunicação.</p>
            <Link to="/curso/3" className="course-button">Começar</Link>
          </div>
        </div>
      </section>

      <section>
        <h3>Em Progresso</h3>
        <div className="progress-card">
          <p>Produção de Pães Artesanais</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "60%" }} />
          </div>
        </div>
      </section>

      <section>
        <h3>Medalhas</h3>
        <div className="badges-list">
          <div className="badge-item">🥇 Higiene</div>
          <div className="badge-item">🥈 Atendimento</div>
        </div>
      </section>

      <section>
        <h3>Minigames</h3>
        <div className="cards-grid">
          <div className="card">
            <h4>Quiz de Segurança</h4>
            <button>Jogar</button>
          </div>
          <div className="card">
            <h4>Desafio da Receita</h4>
            <button>Jogar</button>
          </div>
        </div>
      </section>
    </div>
  );
}
