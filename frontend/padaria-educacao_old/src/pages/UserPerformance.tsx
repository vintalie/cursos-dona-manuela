import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const progressoData = [
  { mes: "Jan", media: 60 },
  { mes: "Fev", media: 70 },
  { mes: "Mar", media: 80 },
  { mes: "Abr", media: 85 },
  { mes: "Mai", media: 90 },
];

const acertosData = [
  { nome: "Atendimento", acertos: 90 },
  { nome: "Vendas", acertos: 75 },
  { nome: "Higiene", acertos: 88 },
];

const conclusaoData = [
  { name: "Concluído", value: 8 },
  { name: "Em andamento", value: 3 },
];

export default function UserPerformance() {
  const userType = localStorage.getItem("userType");

  return (
    <div>
      <h2>Dashboard de Progresso</h2>

      {/* 1 - Resumo Geral */}
      <div className="card">
        <h4>Resumo</h4>
        <p>Média Geral: 88%</p>
        <p>Cursos Concluídos: 8</p>
        <p>Total de Avaliações: 25</p>
      </div>

      {/* 2 - Evolução mensal */}
      <div className="card">
        <h4>Evolução de Desempenho</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressoData}>
            <Line type="monotone" dataKey="media" stroke="#2563eb" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3 - Acertos por disciplina */}
      <div className="card">
        <h4>Acertos por Disciplina</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={acertosData}>
            <Bar dataKey="acertos" fill="#10b981" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 - Conclusão de Cursos */}
      <div className="card">
        <h4>Status dos Cursos</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={conclusaoData}
              dataKey="value"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              <Cell fill="#2563eb" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 5 - Timeline */}
      <div className="card">
        <h4>Timeline de Progresso</h4>
        <ul>
          <li>✔ Curso Atendimento concluído - 12/01</li>
          <li>✔ Avaliação Vendas - 85% - 20/02</li>
          <li>✔ Curso Higiene concluído - 05/03</li>
          <li>✔ Avaliação Final - 92% - 10/04</li>
        </ul>
      </div>

      {/* 6 - Ranking (Somente gerente) */}
      {userType === "gerente" && (
        <div className="card">
          <h4>Ranking Interno</h4>
          <ol>
            <li>João Silva - 95%</li>
            <li>Maria Souza - 91%</li>
            <li>Carlos Mendes - 45%</li>
          </ol>
        </div>
      )}
    </div>
  );
}