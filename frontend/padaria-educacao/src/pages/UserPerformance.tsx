import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { setDocumentTitle } from "@/config/appConfig";
import { getMyPerformance, getUserPerformance, type UserPerformanceData, type UserStatus } from "@/services/performance.service";

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; chartColor: string }> = {
  nao_iniciado: { label: "Não Iniciado", color: "text-muted-foreground", chartColor: "#94a3b8" },
  em_andamento: { label: "Em Andamento", color: "text-blue-600", chartColor: "#3b82f6" },
  aprovado: { label: "Aprovado", color: "text-green-600", chartColor: "#22c55e" },
  reprovado: { label: "Reprovado", color: "text-red-600", chartColor: "#ef4444" },
};
import GaugeChart from "@/components/performance/GaugeChart";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

export default function UserPerformance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isGerente } = useAuth();
  const [data, setData] = useState<UserPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnDashboard = location.pathname === "/meu-desempenho" || id === "me";

  useEffect(() => {
    setDocumentTitle(isOwnDashboard ? "Meu Desempenho" : "Desempenho do Aluno");
  }, [isOwnDashboard]);

  function fetchData() {
    setLoading(true);
    if (isOwnDashboard) {
      getMyPerformance()
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else if (id && isGerente) {
      getUserPerformance(parseInt(id, 10))
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id, isGerente, isOwnDashboard]);

  if (!isOwnDashboard && !isGerente) {
    navigate("/meu-desempenho");
    return null;
  }

  const { user, stats, courses, timeline } = data ?? {};
  const acertos = stats?.average_score ?? 0;
  const erros = 100 - acertos;

  const statusCfg = stats ? STATUS_CONFIG[stats.status] : null;
  const pieData = data && statusCfg
    ? [{ name: statusCfg.label, value: 1, color: statusCfg.chartColor }]
    : [];

  return (
    <PageLoader loading={loading}>
    {!loading && !data && (
      <div>
        <h2 className="mb-5 text-xl font-bold text-foreground">
          {isOwnDashboard ? "Meu Desempenho" : "Desempenho do Aluno"}
        </h2>
        <div className="empty-state-wrapper bg-card rounded-xl border border-border">
          <EmptyState
            variant="error"
            title="Não foi possível carregar os dados"
            description="Verifique sua conexão e tente novamente."
            onRetry={fetchData}
          />
        </div>
      </div>
    )}
    {data && (
    <div className="user-performance-dashboard">
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">
        {isOwnDashboard ? "Meu Desempenho" : `Desempenho - ${user.name}`}
      </h2>

      <div className="performance-overview-cards mb-6">
        <div className="stat-card">
          <span className="stat-value">{stats.average_score}%</span>
          <span className="stat-label">Média Geral</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.courses_completed}</span>
          <span className="stat-label">Cursos Concluídos</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.assessments_completed}</span>
          <span className="stat-label">Avaliações</span>
        </div>
        <div className="stat-card">
          <span className={`stat-value ${STATUS_CONFIG[stats.status]?.color ?? "text-muted-foreground"}`}>
            {STATUS_CONFIG[stats.status]?.label ?? stats.status}
          </span>
          <span className="stat-label">Status</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <GaugeChart
            acertos={acertos}
            erros={erros}
            title="Taxa de Acertos"
          />
        </div>

        <div className="chart-card">
          <h4 className="text-sm font-semibold mb-3">Timeline de Desempenho</h4>
          {(timeline?.length ?? 0) === 0 ? (
            <div className="chart-empty">
              <p className="text-sm text-muted-foreground">Nenhuma avaliação realizada ainda.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeline ?? []}>
              <Line type="monotone" dataKey="media" stroke="hsl(var(--primary))" strokeWidth={2} />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h4 className="text-sm font-semibold mb-3">Status</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name }) => name}
              >
                <Cell fill={pieData[0].color} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card col-span-2">
          <h4 className="text-sm font-semibold mb-3">Progresso por Curso</h4>
          {(courses?.length ?? 0) === 0 ? (
            <div className="chart-empty">
              <p className="text-sm text-muted-foreground">Nenhum curso matriculado.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courses ?? []} layout="vertical" margin={{ left: 20 }}>
              <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="title" width={120} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
    )}
    </PageLoader>
  );
}
