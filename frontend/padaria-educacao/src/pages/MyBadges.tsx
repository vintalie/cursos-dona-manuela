import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { getDashboard } from "@/services/dashboard.service";
import { Star } from "lucide-react";

export default function MyBadges() {
  const [badges, setBadges] = useState<Array<{
    id: number;
    title: string;
    short_description?: string;
    long_description?: string;
    image?: string;
    icon?: string;
    earned_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setDocumentTitle("Minhas Medalhas");
    getDashboard()
      .then((d) => setBadges(d.badges))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedBadge = badges.find((b) => b.id === selected);

  return (
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Minhas Medalhas</h2>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : badges.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não conquistou nenhuma medalha. Complete cursos e matérias para desbloquear!</p>
      ) : (
        <>
          <div className="badges-grid mb-8">
            {badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelected(selected === badge.id ? null : badge.id)}
                className={`badge-manager-card text-left transition-all ${selected === badge.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="badge-manager-header">
                  {badge.image ? (
                    <img src={badge.image} alt={badge.title} className="badge-manager-img" />
                  ) : (
                    <Star size={40} fill="currentColor" className="badge-manager-icon" />
                  )}
                  <div className="flex-1">
                    <h4>{badge.title}</h4>
                    {badge.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{badge.short_description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Conquistada em {new Date(badge.earned_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedBadge && (
            <div className="bg-card p-6 rounded-xl border border-border max-w-xl">
              <div className="flex items-start gap-4 mb-4">
                {selectedBadge.image ? (
                  <img src={selectedBadge.image} alt={selectedBadge.title} className="w-16 h-16 object-contain rounded" />
                ) : (
                  <Star size={64} fill="currentColor" className="text-primary flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold mb-2">{selectedBadge.title}</h3>
                  {selectedBadge.long_description ? (
                    <div className="prose prose-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: selectedBadge.long_description }} />
                  ) : selectedBadge.short_description ? (
                    <p className="text-muted-foreground">{selectedBadge.short_description}</p>
                  ) : null}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Conquistada em {new Date(selectedBadge.earned_at).toLocaleDateString("pt-BR", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
