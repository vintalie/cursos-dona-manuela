import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "Padaria Educação";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Login",
  "/dashboard": "Dashboard",
  "/cursos": "Cursos",
  "/minhas-medalhas": "Minhas Medalhas",
  "/minigames": "Minigames",
  "/meu-desempenho": "Meu Desempenho",
  "/configuracoes": "Configurações",
  "/usuarios": "Usuários",
  "/medalhas": "Medalhas",
  "/notificacoes": "Notificações",
  "/criacao": "Criação de Conteúdo",
  "/minigames-gerente": "Minigames",
  "/midias": "Mídias",
  "/desempenhos": "Desempenhos",
};

function getTitleForPath(pathname: string): string {
  const basePath = pathname.split("/").slice(0, 3).join("/") || "/";
  const exact = ROUTE_TITLES[pathname] ?? ROUTE_TITLES[basePath];
  if (exact) return exact;

  if (pathname.startsWith("/curso/")) return "Curso";
  if (pathname.startsWith("/minigame/play/")) return "Minigame";
  if (pathname.startsWith("/usuarios/") && pathname.includes("/editar")) return "Editar Usuário";
  if (pathname.startsWith("/desempenhos/")) return "Desempenho";

  return "Padaria Educação";
}

export function useDocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = getTitleForPath(pathname);
    document.title = pageTitle === BASE_TITLE ? BASE_TITLE : `${pageTitle} | ${BASE_TITLE}`;
  }, [pathname]);
}
