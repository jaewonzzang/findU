// frontend/src/hooks/useAuth.tsx

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthUser, fetchMe, kakaoLoginUrl, logoutRequest } from "../api";

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

// user 상태를 컴포넌트마다 따로 들면 한 곳에서 로그아웃해도 나머지가 옛 user를 붙잡아
// 즐겨찾기·저장 주소가 화면에 남는다. 상태를 한 번만 만들어 전역으로 공유한다.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있다.");
  return value;
}
