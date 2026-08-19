import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../../features/auth/services/authService";
import { refreshAccessToken } from "../services/api";
import { setAccessToken, clearAccessToken, onUnauthorized } from "../services/tokenStore";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => setUser(null));
    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const { data } = await refreshAccessToken();
        setAccessToken(data.data.accessToken);
        if (isMounted) setUser(data.data.user);
      } catch {
        clearAccessToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setAccessToken(result.data.accessToken);
    setUser(result.data.user);
    return result.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      logoutAll,
      updateUser,
    }),
    [user, isBootstrapping, login, logout, logoutAll, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
