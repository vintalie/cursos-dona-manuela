import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { User, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout() {
  const { isGerente, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);

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
    </div>
  );
}
