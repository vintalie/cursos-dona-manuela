import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkEmail,
  login as loginApi,
  register as registerApi,
  getGoogleLoginUrl,
} from "@/services/auth.service";
import { getMe } from "@/services/auth.service";
import { setDocumentTitle } from "@/config/appConfig";
import { showAlert } from "@/contexts/AlertPopupContext";

type Step = "email" | "password" | "register";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loginStore, isAuthenticated, isLoading, isGerente } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(isGerente ? "/desempenhos" : "/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, isGerente, navigate]);

  useEffect(() => {
    setDocumentTitle("Login");
  }, []);

  // Processar token do Google OAuth no retorno
  useEffect(() => {
    const token = searchParams.get("token");
    const err = searchParams.get("error");

    if (err) {
      const messages: Record<string, string> = {
        google_auth_failed: "Falha ao autenticar com Google. Tente novamente.",
        google_not_configured: "Login com Google não está configurado. Use e-mail e senha.",
      };
      showAlert({
        type: "error",
        message: messages[err] ?? "Ocorreu um erro. Tente novamente.",
      });
      setSearchParams({}, { replace: true });
      return;
    }

    if (token) {
      setLoading(true);
      localStorage.setItem("token", token);
      setSearchParams({}, { replace: true });

      getMe()
        .then((user) => {
          loginStore(token, user);
          navigate(user.tipo === "gerente" ? "/desempenhos" : "/dashboard");
        })
        .catch(() => {
          showAlert({
            type: "error",
            message: "Falha ao carregar dados do usuário. Tente novamente.",
          });
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, setSearchParams, loginStore, navigate]);

  async function handleContinueEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { exists } = await checkEmail(email);
      setSlideDir("next");
      if (exists) {
        setStep("password");
      } else {
        setName(email.split("@")[0] || "");
        setStep("register");
      }
    } catch {
      showAlert({
        type: "error",
        message: "Não foi possível verificar o e-mail. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      loginStore(data.access_token, data.user);
      navigate(data.user.tipo === "gerente" ? "/desempenhos" : "/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message;
      showAlert({ type: "error", message: msg || "Credenciais inválidas." });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await registerApi(name, email, password);
      loginStore(data.access_token, data.user);
      navigate(data.user.tipo === "gerente" ? "/desempenhos" : "/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr?.response?.data;
      let msg = "Erro ao criar conta. Tente novamente.";
      if (data && typeof data === "object") {
        const firstMsg = Object.values(data).flat()[0];
        if (firstMsg) msg = firstMsg;
      }
      showAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setSlideDir("prev");
    setStep("email");
    setPassword("");
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleLoginUrl();
  }

  if (loading && searchParams.get("token")) {
    return (
      <div className="login-container">
        <div className="login-box text-center">
          <p className="text-muted-foreground">Entrando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form
        className="login-box"
        onSubmit={
          step === "email"
            ? handleContinueEmail
            : step === "password"
              ? handleLogin
              : handleRegister
        }
      >
        <h2>Sistema Educacional - Padaria</h2>

        <div className="login-slide-wrap">
          <div
            key={step}
            className={`login-slide-content login-slide-${slideDir}`}
          >
            {step === "email" && (
              <>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Verificando..." : "Continuar"}
                </button>
              </>
            )}

            {step === "password" && (
              <>
                <p className="login-email-display">{email}</p>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <div className="login-buttons-row">
                  <button type="submit" disabled={loading} className="login-btn-primary">
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                  <button
                    type="button"
                    className="login-back-btn"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}

            {step === "register" && (
              <>
                <p className="login-warning-text">
                  E-mail não cadastrado. Preencha os campos abaixo para criar sua conta.
                </p>
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly
                  className="opacity-75"
                />
                <input
                  type="password"
                  placeholder="Senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <div className="login-buttons-row">
                  <button type="submit" disabled={loading} className="login-btn-primary">
                    {loading ? "Criando conta..." : "Criar conta"}
                  </button>
                  <button
                    type="button"
                    className="login-back-btn"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button
          type="button"
          className="login-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Entrar com Google
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
