import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerDashboard from "./pages/ManagerDashboard";
import Performance from "./pages/Performance";
import CoursesManager from "./pages/CoursersManage";
import UserPerformance from "./pages/UserPerformance";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Layout from "./components/Layout";
import CourseLearning from "./pages/CourseLearning";

const userType = localStorage.getItem("userType") === "gerente";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login sem Layout */}
        <Route path="/" element={<Login />} />

        {/* Rotas com Layout */}
        <Route element={<Layout />}>
          {/* Gerente */}
          <Route path="/usuarios" element={<Users />} />
          <Route path="/cursos-manager" element={<CoursesManager />} />
          <Route path="/criacao" element={<ManagerDashboard />} />
          <Route path="/desempenhos" element={<Performance />} />
          <Route path="/desempenhos/:id" element={<UserPerformance />} />
          {/* Funcionário */}
          <Route path="/cursos" element={<Courses />} />
          <Route
            path="/curso/higiene-na-manipulacao"
            element={<CourseLearning />}
          />
          <Route
            path="/dashboard"
            element={
              userType === true? <ManagerDashboard /> : <Dashboard />
            }
          />
          <Route path="/meu-desempenho" element={<Performance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}