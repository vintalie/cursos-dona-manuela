import { useMemo, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { User, Bell, Settings, LogOut } from "lucide-react";
import { logout } from "../utils/logout";

export default function Layout() {
  const navigate = useNavigate();

  const userType = useMemo(
    () => localStorage.getItem("userType"),
    []
  );

  const isGerente = userType === "gerente";

  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          background: "#1e293b",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Menu superior */}
        <div>
          <h2>Painel</h2>

          {isGerente ? (
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/usuarios" className="menu-link">
                Usuários
              </Link>
              <Link to="/cursos-manager" className="menu-link">
                Cursos
              </Link>
              <Link to="/criacao" className="menu-link">
                Criação
              </Link>
              <Link to="/desempenhos" className="menu-link">
                Desempenhos
              </Link>
            </nav>
          ) : (
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/dashboard" className="menu-link">
                Dashboard
              </Link>
              <Link to="/cursos" className="menu-link">
                Cursos
              </Link>
              <Link to="/meu-desempenho" className="menu-link">
                Meu Desempenho
              </Link>
            </nav>
          )}
        </div>

        {/* Barra inferior */}
        <div style={{ position: "relative" }}>
          {/* Linha clean */}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.2)",
              width: "80%",
              margin: "0 auto 15px auto",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {/* Notificações */}
            <Bell
              size={20}
              style={{ cursor: "pointer" }}
            />

            {/* Usuário */}
            <div style={{ position: "relative" }}>
              <User
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setOpenDropdown(!openDropdown)}
              />

              {openDropdown && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "35px",
                    right: 0,
                    background: "#334155",
                    borderRadius: "8px",
                    padding: "10px",
                    width: "160px",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Settings size={16} />
                    Configurações
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px",
                      cursor: "pointer",
                    }}
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "30px", background: "#f1f5f9" }}>
        <Outlet />
      </main>
    </div>
  );
}