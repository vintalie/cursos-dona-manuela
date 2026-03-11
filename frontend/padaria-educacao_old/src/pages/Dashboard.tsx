
export default function Dashboard() {
  return (
  
      <div className="dashboard">
        <h2>Bem-vindo ao Sistema Educacional</h2>

        {/* Cursos em Destaque */}
        <section>
          <h3>Cursos em Destaque</h3>
          <div className="cards">
            <div className="card">
              <h4>Higiene na Manipulação</h4>
              <p>Aprenda boas práticas sanitárias.</p>
              <button>Começar</button>
            </div>

            <div className="card">
              <h4>Atendimento ao Cliente</h4>
              <p>Melhore sua comunicação.</p>
              <button>Começar</button>
            </div>
          </div>
        </section>

        {/* Em Progresso */}
        <section>
          <h3>Em Progresso</h3>
          <div className="progress-card">
            <p>Produção de Pães Artesanais</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: "60%" }} />
            </div>
          </div>
        </section>

        {/* Medalhas */}
        <section>
          <h3>Medalhas</h3>
          <div className="badges">
            <div className="badge">🥇 Higiene</div>
            <div className="badge">🥈 Atendimento</div>
          </div>
        </section>

        {/* Minigames */}
        <section>
          <h3>Minigames</h3>
          <div className="cards">
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