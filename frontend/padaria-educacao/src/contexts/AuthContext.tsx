import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";
import { getMe, logoutApi } from "@/services/auth.service";

const USER_CACHE_KEY = "user";

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGerente: boolean;
  loginStore: (token: string, user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(getCachedUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (u: User | null) => {
    setUserState(u);
    setCachedUser(u);
  };

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        const axiosErr = err as { response?: { status?: number }; code?: string };
        const isNetworkError = !axiosErr?.response && axiosErr?.code === "ERR_NETWORK";
        const isAuthError = axiosErr?.response?.status === 401;

        if (isAuthError) {
          // api.ts interceptor already cleared the token + redirected;
          // mirror the state so React is in sync.
          setToken(null);
          setUser(null);
        } else if (isNetworkError) {
          // Offline: keep the token and use the cached user so the app stays open.
          // The user will re-validate automatically when connectivity is restored.
        } else {
          // Unexpected server error — keep token, cached user stays as-is.
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loginStore = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Proceed with local logout even if the server call fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem(USER_CACHE_KEY);
      setToken(null);
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isGerente: user?.tipo === "gerente",
        loginStore,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
