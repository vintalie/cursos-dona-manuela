import { lazy, Suspense } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AlertPopupProvider } from "@/contexts/AlertPopupContext";
import PrivateRoute from "@/components/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";
import PageLoader from "@/components/ui/PageLoader";
import OfflineIndicator from "@/components/OfflineIndicator";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Courses = lazy(() => import("@/pages/Courses"));
const CourseLearning = lazy(() => import("@/pages/CourseLearning"));
const ManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const Users = lazy(() => import("@/pages/Users"));
const EditUser = lazy(() => import("@/pages/EditUser"));
const Performance = lazy(() => import("@/pages/Performance"));
const UserPerformance = lazy(() => import("@/pages/UserPerformance"));
const Settings = lazy(() => import("@/pages/Settings"));
const BadgesManager = lazy(() => import("@/pages/BadgesManager"));
const NotificationsManager = lazy(() => import("@/pages/NotificationsManager"));
const MyBadges = lazy(() => import("@/pages/MyBadges"));
const Minigames = lazy(() => import("@/pages/Minigames"));
const MinigamesManager = lazy(() => import("@/pages/MinigamesManager"));
const MinigamePlayer = lazy(() => import("@/pages/MinigamePlayer"));
const MediaManager = lazy(() => import("@/pages/MediaManager"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  useDocumentTitle();
  return (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

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
                <Route path="/usuarios/:id/editar" element={<EditUser />} />
                <Route path="/medalhas" element={<BadgesManager />} />
                <Route path="/notificacoes" element={<NotificationsManager />} />
                <Route path="/criacao" element={<ManagerDashboard />} />
                <Route path="/minigames-gerente" element={<MinigamesManager />} />
                <Route path="/midias" element={<MediaManager />} />
                <Route path="/desempenhos" element={<Performance />} />
                <Route path="/desempenhos/:id" element={<UserPerformance />} />
              </Route>
            </Route>

            {/* Rota dinâmica de curso */}
            <Route element={<PrivateRoute />}>
              <Route path="/curso/:id" element={<CourseLearning />} />
            </Route>

            {/* Player de minigame (standalone, para uso em iframe) */}
            <Route element={<PrivateRoute />}>
              <Route path="/minigame/play/:id" element={<MinigamePlayer />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OfflineIndicator />
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AlertPopupProvider>
            <Suspense fallback={<PageLoader loading />}>
              <AppContent />
            </Suspense>
          </AlertPopupProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
