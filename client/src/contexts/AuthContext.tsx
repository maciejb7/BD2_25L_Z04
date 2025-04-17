import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "../services/api";
import { AuthState, User } from "../types";

interface AuthContextType extends AuthState {
  login: (nicknameOrEmail: string, password: string) => Promise<void>;
  register: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Try to refresh token
        const { accessToken: newToken, user } = await authApi.refresh();
        localStorage.setItem("accessToken", newToken);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem("accessToken");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Session expired. Please login again.",
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (nicknameOrEmail: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { accessToken, user } = await authApi.login(
        nicknameOrEmail,
        password,
      );

      localStorage.setItem("accessToken", accessToken);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
    }
  };

  const register = async (userData: User) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { accessToken, user } = await authApi.register(userData);

      localStorage.setItem("accessToken", accessToken);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }));
    }
  };

  const logout = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await authApi.logout();

      localStorage.removeItem("accessToken");

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
