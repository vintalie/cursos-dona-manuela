import { Suspense, useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Outlet, Link, NavLink, useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { useAnimatedPresence } from "@/hooks/useAnimatedPresence";
import {
  User,
  Bell,
  Settings,
  LogOut,
  Home,
  BookOpen,
  BarChart3,
  Users,
  LayoutList,
  Award,
  Gamepad2,
  MoreHorizontal,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/ui/PageLoader";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import NotificationPermissionPopup from "@/components/notifications/NotificationPermissionPopup";
import PWAInstallCard from "@/components/PWAInstallCard";

export default function AppLayout() {
  const { isGerente, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [moreDropdownPosition, setMoreDropdownPosition] = useState({ bottom: 0, right: 0 });
  const location = useLocation();
  const navType = useNavigationType();

  // Animated presence for dropdown, sidebar overlay, and more menu
  const { mounted: dropdownMounted, closing: dropdownClosing } = useAnimatedPresence(openDropdown, 110);
  const { mounted: overlayMounted, closing: overlayClosing } = useAnimatedPresence(sidebarOpen, 140);
  const { mounted: moreMounted, closing: moreClosing } = useAnimatedPresence(openMoreMenu, 110);

  // Page transition: animate only on forward/replace navigation, not on back (POP)
  const [pageAnimClass, setPageAnimClass] = useState("");
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      if (navType === "PUSH" || navType === "REPLACE") {
        setPageAnimClass("page-enter");
      }
      prevPath.current = location.pathname;
      setOpenMoreMenu(false);
    }
  }, [location.pathname, navType]);

  useLayoutEffect(() => {
    if (openMoreMenu && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMoreDropdownPosition({
        bottom: window.innerHeight - rect.top + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, [openMoreMenu]);

  const PAGE_TITLES: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/cursos": "Cursos",
    "/minhas-medalhas": "Minhas Medalhas",
    "/minigames": "Minigames",
    "/meu-desempenho": "Meu Desempenho",
    "/configuracoes": "Configurações",
    "/usuarios": "Usuários",
    "/medalhas": "Medalhas",
    "/notificacoes": "Notificações",
    "/criacao": "Criação",
    "/minigames-gerente": "Minigames",
    "/midias": "Mídias",
    "/desempenhos": "Desempenhos",
  };

  const pageTitle = (() => {
    const path = location.pathname;
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
    if (path.startsWith("/desempenhos/")) return "Desempenho";
    return "Painel";
  })();

  const employeeItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/cursos", label: "Cursos", icon: BookOpen },
    { to: "/minhas-medalhas", label: "Medalhas", icon: Award },
    { to: "/meu-desempenho", label: "Meu Desempenho", icon: BarChart3 },
  ];

  const managerMainNav = [
    { to: "/desempenhos", label: "Desempenhos", icon: BarChart3 },
    { to: "/criacao", label: "Criação", icon: LayoutList },
    { to: "/notificacoes", label: "Notificações", icon: Bell },
  ];

  const managerMoreItems = [
    { to: "/usuarios", label: "Usuários", icon: Users },
    { to: "/cursos", label: "Cursos", icon: BookOpen },
    { to: "/minigames-gerente", label: "Minigames", icon: Gamepad2 },
    { to: "/medalhas", label: "Medalhas", icon: Award },
    { to: "/midias", label: "Mídias", icon: ImageIcon },
  ];

  const managerAllItems = [...managerMainNav, ...managerMoreItems];

  const bottomNavItems = isGerente ? managerMainNav : employeeItems;
  const isMoreItemActive = isGerente && managerMoreItems.some((item) => location.pathname === item.to);

  return (
    <div className="app-layout">
      <NotificationPermissionPopup />
      <PWAInstallCard />
      {/* Mobile topbar */}
      <header className="mobile-topbar">
        <h1 className="mobile-topbar-title">{pageTitle}</h1>
        <div className="mobile-topbar-actions">
          <NotificationPanel variant="topbar" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(!openDropdown)}
              className="topbar-icon-btn"
              aria-label="Menu do usuário"
            >
              <User size={22} />
            </button>
            {dropdownMounted && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenDropdown(false)}
                  aria-hidden
                />
                <div className={`mobile-user-dropdown ${dropdownClosing ? "is-closing" : "is-entering"}`}>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/configuracoes");
                      setOpenDropdown(false);
                    }}
                  >
                    <Settings size={16} /> Configurações
                  </div>
                  <div className="dropdown-item" onClick={() => { logout(); setOpenDropdown(false); }}>
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      {overlayMounted && (
        <div
          className={`sidebar-overlay ${overlayClosing ? "overlay-closing" : "overlay-entering"}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside className={`layout-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-header-mobile">
            <h2>Painel</h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-close-btn"
              aria-label="Fechar menu"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          {isGerente ? (
            <nav onClick={() => setSidebarOpen(false)}>
              {managerAllItems.map((item) => (
                <Link key={item.to} to={item.to} className="menu-link">{item.label}</Link>
              ))}
            </nav>
          ) : (
            <nav onClick={() => setSidebarOpen(false)}>
              <Link to="/dashboard" className="menu-link">Dashboard</Link>
              <Link to="/cursos" className="menu-link">Cursos</Link>
              <Link to="/minigames" className="menu-link">Minigames</Link>
              <Link to="/minhas-medalhas" className="menu-link">Medalhas</Link>
              <Link to="/meu-desempenho" className="menu-link">Meu Desempenho</Link>
            </nav>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="divider" />
          <div className="icons flex justify-center items-center gap-10 w-full">
            <div className="flex justify-center items-center gap-10" style={{ position: "relative" }}>
              <div className="relative flex justify-center">
                <NotificationPanel />
              </div>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="sidebar-icon-btn"
                  aria-label="Menu do usuário"
                >
                  <User size={20} />
                </button>
                {dropdownMounted && (
                  <div className={`user-dropdown ${dropdownClosing ? "is-closing" : "is-entering"}`}>
                    <div className="dropdown-item" onClick={() => { navigate("/configuracoes"); setOpenDropdown(false); }}>
                      <Settings size={16} /> Configurações
                    </div>
                    <div className="dropdown-item" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="layout-main">
        <div
          className={`layout-main-inner ${pageAnimClass}`}
          onAnimationEnd={() => setPageAnimClass("")}
        >
          <PageLoader loading={isLoading}>
            <Suspense fallback={<PageLoader loading />}>
              <Outlet />
            </Suspense>
          </PageLoader>
        </div>
      </main>

      <nav className="bottom-nav">
        <div className="bottom-nav-track">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `bottom-nav-item${isActive ? " bottom-nav-item-active" : ""}`
                }
              >
                <Icon className="bottom-nav-icon" />
                <span className="bottom-nav-label">{item.label}</span>
              </NavLink>
            );
          })}
          {isGerente && (
            <div className="bottom-nav-item-wrapper">
              <button
                ref={moreButtonRef}
                type="button"
                className={`bottom-nav-item${isMoreItemActive ? " bottom-nav-item-active" : ""}`}
                onClick={() => setOpenMoreMenu(!openMoreMenu)}
                aria-label="Mais opções"
              >
                <MoreHorizontal className="bottom-nav-icon" />
                <span className="bottom-nav-label">Mais</span>
              </button>
              {moreMounted &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[45]"
                      onClick={() => setOpenMoreMenu(false)}
                      aria-hidden
                    />
                    <div
                      className={`bottom-nav-more-dropdown bottom-nav-more-dropdown--fixed ${moreClosing ? "is-closing" : "is-entering"}`}
                      style={{
                        bottom: moreDropdownPosition.bottom,
                        right: moreDropdownPosition.right,
                      }}
                    >
                      {managerMoreItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`bottom-nav-more-item${isActive ? " active" : ""}`}
                            onClick={() => setOpenMoreMenu(false)}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>,
                  document.body
                )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
