import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import CourseLearning from "@/pages/CourseLearning";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Users from "@/pages/Users";
import Performance from "@/pages/Performance";
import UserPerformance from "@/pages/UserPerformance";
import Settings from "@/pages/Settings";
import BadgesManager from "@/pages/BadgesManager";
import NotificationsManager from "@/pages/NotificationsManager";
import MyBadges from "@/pages/MyBadges";
import Minigames from "@/pages/Minigames";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Rotas protegidas com Layout */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                {/* Funcionário */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cursos" element={<Courses />} />
                <Route path="/minhas-medalhas" element={<MyBadges />} />
                <Route path="/minigames" element={<Minigames />} />
                <Route path="/meu-desempenho" element={<UserPerformance />} />

                <Route path="/configuracoes" element={<Settings />} />

                {/* Gerente */}
                <Route path="/usuarios" element={<Users />} />
                <Route path="/medalhas" element={<BadgesManager />} />
                <Route path="/notificacoes" element={<NotificationsManager />} />
                <Route path="/criacao" element={<ManagerDashboard />} />
                <Route path="/desempenhos" element={<Performance />} />
                <Route path="/desempenhos/:id" element={<UserPerformance />} />
              </Route>
            </Route>

            {/* Rota dinâmica de curso */}
            <Route element={<PrivateRoute />}>
              <Route path="/curso/:id" element={<CourseLearning />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
