import { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout() {
  const { isGerente, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);

  const employeeItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/cursos", label: "Cursos", icon: BookOpen },
    { to: "/meu-desempenho", label: "Meu Desempenho", icon: BarChart3 },
  ];

  const managerItems = [
    { to: "/usuarios", label: "Usuários", icon: Users },
    { to: "/cursos-manager", label: "Cursos", icon: BookOpen },
    { to: "/criacao", label: "Criação", icon: LayoutList },
    { to: "/desempenhos", label: "Desempenhos", icon: BarChart3 },
  ];

  const bottomNavItems = isGerente ? managerItems : employeeItems;

  return (
    <div className="app-layout">
      <aside className="layout-sidebar">
        <div>
          <h2>Painel</h2>
          {isGerente ? (
            <nav>
              <Link to="/usuarios" className="menu-link">Usuários</Link>
              <Link to="/cursos-manager" className="menu-link">Cursos</Link>
              <Link to="/criacao" className="menu-link">Criação</Link>
              <Link to="/desempenhos" className="menu-link">Desempenhos</Link>
            </nav>
          ) : (
            <nav>
              <Link to="/dashboard" className="menu-link">Dashboard</Link>
              <Link to="/cursos" className="menu-link">Cursos</Link>
              <Link to="/meu-desempenho" className="menu-link">Meu Desempenho</Link>
            </nav>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="divider" />
          <div className="icons">
            <Bell size={20} />
            <div style={{ position: "relative" }}>
              <User size={20} onClick={() => setOpenDropdown(!openDropdown)} />
              {openDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-item">
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
      </aside>

      <main className="layout-main">
        <Outlet />
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
