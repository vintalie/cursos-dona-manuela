import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isGerente } = useAuth();

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-foreground">Dashboard de Progresso</h2>

      <div className="card">
        <h4>Resumo</h4>
        <p>Média Geral: 88%</p>
        <p>Cursos Concluídos: 8</p>
        <p>Total de Avaliações: 25</p>
      </div>

      <div className="card">
        <h4>Evolução de Desempenho</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressoData}>
            <Line type="monotone" dataKey="media" stroke="hsl(0, 60%, 45%)" />
            <CartesianGrid stroke="#e2e8f0" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Acertos por Disciplina</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={acertosData}>
            <Bar dataKey="acertos" fill="hsl(30, 70%, 50%)" radius={[6, 6, 0, 0]} />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Status dos Cursos</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={conclusaoData} dataKey="value" outerRadius={100} label>
              <Cell fill="hsl(0, 60%, 45%)" />
              <Cell fill="hsl(30, 70%, 50%)" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Timeline de Progresso</h4>
        <ul className="list-none space-y-2">
          <li>✔ Curso Atendimento concluído - 12/01</li>
          <li>✔ Avaliação Vendas - 85% - 20/02</li>
          <li>✔ Curso Higiene concluído - 05/03</li>
          <li>✔ Avaliação Final - 92% - 10/04</li>
        </ul>
      </div>

      {isGerente && (
        <div className="card">
          <h4>Ranking Interno</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>João Silva - 95%</li>
            <li>Maria Souza - 91%</li>
            <li>Carlos Mendes - 45%</li>
          </ol>
        </div>
      )}
    </div>
  );
}
