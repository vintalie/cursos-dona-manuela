import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "recharts";
import { ChevronRight, BookOpen, Users } from "lucide-react";
import { setDocumentTitle } from "@/config/appConfig";
import {
  getPerformanceOverview,
  getCourseStats,
  type PerformanceOverview,
  type CourseStats,
  type UserStatus,
} from "@/services/performance.service";

const STATUS_CONFIG: Record<UserStatus, { label: string; badge: string; color: string }> = {
  nao_iniciado: { label: "Não Iniciado", badge: "badge-muted", color: "text-muted-foreground" },
  em_andamento: { label: "Em Andamento", badge: "badge-info", color: "text-blue-600" },
  aprovado: { label: "Aprovado", badge: "badge-success", color: "text-green-600" },
  reprovado: { label: "Reprovado", badge: "badge-danger", color: "text-red-600" },
};
import GaugeChart from "@/components/performance/GaugeChart";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

export default function Performance() {
  const navigate = useNavigate();
  const { isGerente } = useAuth();
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setDocumentTitle("Desempenhos");
  }, []);

  function fetchOverview() {
    setLoading(true);
    setError(false);
    getPerformanceOverview()
      .then((data) => {
        setOverview(data);
        setError(false);
      })
      .catch(() => {
        setOverview(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      getCourseStats(selectedCourseId)
        .then(setCourseStats)
        .catch(() => setCourseStats(null));
    } else {
      setCourseStats(null);
    }
  }, [selectedCourseId]);

  if (!isGerente) {
    return null;
  }

  const courses = overview?.courses ?? [];
  const stats = courseStats ?? null;
  const slides = [
    { id: "speedometer", label: "Taxa de Acertos" },
    { id: "timeline", label: "Timeline" },
    { id: "pie", label: "Aprovados x Reprovados" },
  ];

  return (
    <PageLoader loading={loading}>
      <div className="performance-dashboard">
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Desempenhos</h2>

      <div className="performance-grid">
        <main className="performance-main">
          <div className="performance-charts">
            <div className="chart-slide-nav">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chart-slide-btn ${slideIndex === i ? "active" : ""}`}
                  onClick={() => setSlideIndex(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="chart-slide-content">
              {slideIndex === 0 && (
                <div className="chart-card">
                  <GaugeChart
                    acertos={stats?.speedometer?.acertos ?? 0}
                    erros={stats?.speedometer?.erros ?? 100}
                    title={stats ? `Taxa de acertos - ${stats.course.title}` : "Selecione um curso"}
                  />
                </div>
              )}
              {slideIndex === 1 && (
                <div className="chart-card">
                  <h4 className="text-sm font-semibold mb-3">
                    {stats ? `Timeline - ${stats.course.title}` : "Timeline - Selecione um curso"}
                  </h4>
                  {(!stats?.timeline || stats.timeline.length === 0) ? (
                    <div className="chart-empty">
                      <p className="text-sm text-muted-foreground">
                        {stats ? "Nenhum dado de avaliação para este curso." : "Selecione um curso na barra lateral."}
                      </p>
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={stats.timeline}>
                      <Line type="monotone" dataKey="media" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                </div>
              )}
              {slideIndex === 2 && (
                <div className="chart-card">
                  <h4 className="text-sm font-semibold mb-3">
                    {stats ? `Aprovados x Reprovados - ${stats.course.title}` : "Selecione um curso"}
                  </h4>
                  {(!stats?.pie || stats.pie.length === 0) ? (
                    <div className="chart-empty">
                      <p className="text-sm text-muted-foreground">
                        {stats ? "Nenhum dado de aprovação para este curso." : "Selecione um curso na barra lateral."}
                      </p>
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.pie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats.pie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="performance-overview-cards">
            <div className="stat-card">
              <Users className="stat-icon" />
              <div>
                <span className="stat-value">{overview?.overall?.total_users ?? 0}</span>
                <span className="stat-label">Alunos</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-value text-muted-foreground">{overview?.overall?.nao_iniciado ?? 0}</span>
              <span className="stat-label">Não Iniciados</span>
            </div>
            <div className="stat-card">
              <span className="stat-value text-blue-600">{overview?.overall?.em_andamento ?? 0}</span>
              <span className="stat-label">Em Andamento</span>
            </div>
            <div className="stat-card">
              <span className="stat-value text-green-600">{overview?.overall?.approved ?? 0}</span>
              <span className="stat-label">Aprovados</span>
            </div>
            <div className="stat-card">
              <span className="stat-value text-red-600">{overview?.overall?.failed ?? 0}</span>
              <span className="stat-label">Reprovados</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{overview?.overall?.average_score ?? 0}%</span>
              <span className="stat-label">Média Geral</span>
            </div>
          </div>

          <div className="performance-users">
            <h3 className="text-lg font-semibold mb-3">Alunos</h3>
            {(overview?.users ?? []).length === 0 ? (
              <div className="empty-state-wrapper py-8">
                <EmptyState
                  variant="empty"
                  title="Nenhum aluno encontrado"
                  description="Não há alunos cadastrados ou com avaliações realizadas."
                />
              </div>
            ) : (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Média</th>
                    <th>Cursos concluídos</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.users ?? []).map((u) => (
                    <tr key={u.id} onClick={() => navigate(`/desempenhos/${u.id}`)}>
                      <td>{u.name}</td>
                      <td>{u.average_score}%</td>
                      <td>{u.courses_completed}</td>
                      <td>
                        <span className={STATUS_CONFIG[u.status]?.badge ?? "badge-muted"}>
                          {STATUS_CONFIG[u.status]?.label ?? u.status}
                        </span>
                      </td>
                      <td>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </main>

        <aside className="performance-sidebar">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Cursos
          </h3>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum curso cadastrado.</p>
          ) : (
          <div className="course-list">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`course-sidebar-item ${selectedCourseId === c.id ? "active" : ""}`}
                onClick={() => setSelectedCourseId(c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>
          )}
        </aside>
      </div>
    </div>
    </PageLoader>
  );
}
