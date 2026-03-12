import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import NotificationPermissionPopup from "@/components/notifications/NotificationPermissionPopup";
import PWAInstallCard from "@/components/PWAInstallCard";

export default function AppLayout() {
  const { isGerente, logout } = useAuth();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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

  const managerItems = [
    { to: "/usuarios", label: "Usuários", icon: Users },
    { to: "/cursos", label: "Cursos", icon: BookOpen },
    { to: "/criacao", label: "Criação", icon: LayoutList },
    { to: "/medalhas", label: "Medalhas", icon: Award },
    { to: "/notificacoes", label: "Notificações", icon: Bell },
    { to: "/desempenhos", label: "Desempenhos", icon: BarChart3 },
  ];

  const bottomNavItems = isGerente ? managerItems : employeeItems;

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
            {openDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenDropdown(false)}
                  aria-hidden
                />
                <div className="mobile-user-dropdown">
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
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
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
              <Link to="/usuarios" className="menu-link">Usuários</Link>
              <Link to="/cursos" className="menu-link">Cursos</Link>
              <Link to="/criacao" className="menu-link">Criação</Link>
              <Link to="/medalhas" className="menu-link">Medalhas</Link>
              <Link to="/notificacoes" className="menu-link">Notificações</Link>
              <Link to="/desempenhos" className="menu-link">Desempenhos</Link>
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
                {openDropdown && (
                  <div className="user-dropdown">
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
        <div className="layout-main-inner">
          <Outlet />
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
        </div>
      </nav>
    </div>
  );
}
