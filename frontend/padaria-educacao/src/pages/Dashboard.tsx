import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { setDocumentTitle } from "@/config/appConfig";
import { getDashboard, type DashboardData } from "@/services/dashboard.service";
import PageLoader from "@/components/ui/PageLoader";
import { Star, Gamepad2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDocumentTitle("Dashboard");
    getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLoader loading={loading}>
      <div className="dashboard">
        <h2 className="page-title">Bem-vindo ao Sistema Educacional</h2>

        {data && (
          <>
            <section>
              <h3>Cursos em Destaque</h3>
              <div className="cards-grid">
                {data.featured_courses.length > 0 ? (
                  data.featured_courses.map((course) => (
                    <div key={course.id} className={`card ${course.progress > 0 ? "in-progress" : ""}`}>
                      <h4>
                        {course.title}
                        {course.badges?.length > 0 && (
                          <span className="course-badges ml-2">
                            {course.badges.map((b) => (
                              <span key={b.id} title={b.title} className="badge-icon">
                                {b.image ? (
                                  <img src={b.image} alt={b.title} className="badge-img" />
                                ) : (
                                  <Star size={18} fill="currentColor" />
                                )}
                              </span>
                            ))}
                          </span>
                        )}
                      </h4>
                      {course.short_description && (
                        <p className="text-sm text-muted-foreground mb-2">{course.short_description}</p>
                      )}
                      {course.progress > 0 && (
                        <div className="progress-bar mb-2">
                          <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                        </div>
                      )}
                      <Link to={`/curso/${course.id}`} className="course-button">
                        {course.progress > 0 ? "Continuar" : "Começar"}
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Nenhum curso em destaque no momento.</p>
                )}
              </div>
            </section>

            <section>
              <h3>Em Progresso</h3>
              {data.courses_in_progress.length > 0 ? (
                <div className="progress-list space-y-3">
                  {data.courses_in_progress.map((course) => (
                    <div key={course.id} className="progress-card">
                      <div className="flex justify-between items-center">
                        <Link to={`/curso/${course.id}`} className="font-medium hover:underline">
                          {course.title}
                        </Link>
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
                      </div>
                      <div className="progress-bar mt-2">
                        <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum curso em andamento.</p>
              )}
            </section>

            <section>
              <h3>Minigames</h3>
              <div className="mb-4">
                <Link
                  to="/minigames"
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                >
                  <Gamepad2 size={18} />
                  Jogar minigames
                </Link>
              </div>
            </section>

            <section>
              <h3>Medalhas</h3>
              {data.badges.length > 0 ? (
                <div className="badges-list">
                  {data.badges.map((badge) => (
                    <div key={badge.id} className="badge-item">
                      {badge.image ? (
                        <img src={badge.image} alt={badge.title} className="badge-item-img" />
                      ) : (
                        <Star size={24} fill="currentColor" className="badge-item-icon" />
                      )}
                      <div>
                        <span className="font-medium">{badge.title}</span>
                        {badge.short_description && (
                          <p className="text-sm text-muted-foreground">{badge.short_description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma medalha conquistada ainda.</p>
              )}
            </section>
          </>
        )}

        {!loading && !data && (
          <p className="text-muted-foreground">Não foi possível carregar o dashboard.</p>
        )}
      </div>
    </PageLoader>
  );
}
