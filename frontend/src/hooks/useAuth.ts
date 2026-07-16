// frontend/src/hooks/useAuth.ts

import { useCallback, useEffect, useState } from "react";
import { AuthUser, fetchMe, kakaoLoginUrl, logoutRequest } from "../api";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(() => {
    window.location.href = kakaoLoginUrl;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
