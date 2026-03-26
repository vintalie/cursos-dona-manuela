import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { getDashboard } from "@/services/dashboard.service";
import { Star } from "lucide-react";
import PageLoader from "@/components/ui/PageLoader";

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
    <PageLoader loading={loading}>
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Minhas Medalhas</h2>

      {badges.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não conquistou nenhuma medalha. Complete cursos e matérias para desbloquear!</p>
      ) : (
        <>
          <div className="badges-grid mb-8">
            {badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelected(selected === badge.id ? null : badge.id)}
                className={`badge-manager-card${selected === badge.id ? " ring-2 ring-amber-400/60 border-amber-400/40" : ""}`}
              >
                {/* Topo: imagem ou ícone centralizado */}
                <div className="badge-manager-header">
                  {badge.image ? (
                    <img src={badge.image} alt={badge.title} className="badge-manager-img" />
                  ) : (
                    <div className="badge-icon-wrap badge-icon-wrap--xl">
                      <Star size={24} className="badge-manager-icon" />
                    </div>
                  )}
                </div>

                {/* Corpo: título, descrição e data */}
                <div className="badge-manager-body text-left">
                  <h4 className="font-semibold text-foreground">{badge.title}</h4>
                  {badge.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{badge.short_description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {new Date(badge.earned_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selectedBadge && (
            <div className="bg-card rounded-2xl border border-amber-400/30 max-w-xl overflow-hidden"
              style={{ boxShadow: "0 8px 32px hsl(38 95% 52% / 0.12)" }}
            >
              {/* Accent header */}
              <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-border">
                {selectedBadge.image ? (
                  <img
                    src={selectedBadge.image}
                    alt={selectedBadge.title}
                    className="w-16 h-16 object-contain rounded-xl flex-shrink-0"
                    style={{ boxShadow: "0 4px 14px hsl(var(--foreground) / 0.1)" }}
                  />
                ) : (
                  <div className="badge-icon-wrap flex-shrink-0" style={{ width: "4rem", height: "4rem" }}>
                    <Star size={28} className="text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedBadge.title}</h3>
                  <p className="text-xs text-amber-500 font-medium mt-0.5">
                    ✦ Conquistada em {new Date(selectedBadge.earned_at).toLocaleDateString("pt-BR", { dateStyle: "long" })}
                  </p>
                </div>
              </div>
              {/* Body */}
              {(selectedBadge.long_description || selectedBadge.short_description) && (
                <div className="px-6 py-4">
                  {selectedBadge.long_description ? (
                    <div
                      className="prose prose-sm text-muted-foreground max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedBadge.long_description }}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">{selectedBadge.short_description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </PageLoader>
  );
}
