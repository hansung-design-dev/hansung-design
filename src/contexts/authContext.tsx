'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  is_verified?: boolean;
}

interface Agreements {
  terms: boolean;
  privacy: boolean;
  collection: boolean;
  thirdParty: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    username: string,
    phone: string,
    agreements: Agreements
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 상태 확인 (세션 스토리지에서)
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUser(user);
      // 새로고침 시에도 쿠키 재설정
      document.cookie = `user_id=${user.id}; path=/; max-age=86400`; // 24시간
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        // 사용자 ID를 쿠키에 저장 (API에서 사용)
        document.cookie = `user_id=${data.user.id}; path=/; max-age=86400`; // 24시간
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    username: string,
    phone: string,
    agreements: Agreements
  ) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          username,
          phone,
          agreements,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        // 사용자 ID를 쿠키에 저장 (API에서 사용)
        document.cookie = `user_id=${data.user.id}; path=/; max-age=86400`; // 24시간
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      sessionStorage.removeItem('user');
      // 쿠키에서 사용자 ID 삭제
      document.cookie =
        'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return { success: true };
    } catch {
      return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
