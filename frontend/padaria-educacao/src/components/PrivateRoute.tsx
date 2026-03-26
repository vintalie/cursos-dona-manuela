import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  requiredRole?: "gerente" | "aluno";
}

export default function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user, isGerente } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isLoading && requiredRole && user?.tipo !== requiredRole) {
    return <Navigate to={isGerente ? "/desempenhos" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
