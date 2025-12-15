'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAuth } from '@/src/types/auth';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
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
  login: (user: User | UserAuth) => void;
  signUp: (
    email: string,
    password: string,
    name: string,
    username: string,
    phone: string,
    agreements: Agreements,
    phoneVerificationReference?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorage 키
const USER_AUTH_ID_KEY = 'hansung_user_auth_id';

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
      // 새로고침 시에도 localStorage에 user_auth_id 재저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_AUTH_ID_KEY, user.id);
        console.log(
          '🔍 [AuthContext] 새로고침 시 user_auth_id 재저장:',
          user.id
        );
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('=== AuthContext signIn ===');
      console.log('받은 username:', username);
      console.log('받은 password:', password);

      const requestBody = { username, password };
      console.log('API 요청 body:', requestBody);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // 응답 상태 확인
      if (!response.ok) {
        let errorMessage = '로그인 중 오류가 발생했습니다.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error('서버 에러 상세:', errorData.details);
          }
        } catch {
          errorMessage = `서버 오류 (${response.status})`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log('API 응답:', data);

      if (data.success) {
        setUser(data.user);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        // 사용자 ID를 쿠키에 저장 (API에서 사용)
        document.cookie = `user_id=${data.user.id}; path=/; max-age=86400`; // 24시간
        // user_auth_id를 localStorage에 저장 (장바구니/결제 페이지에서 사용)
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_AUTH_ID_KEY, data.user.id);
          console.log(
            '🔍 [AuthContext] 로그인 시 user_auth_id를 localStorage에 저장:',
            data.user.id
          );
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || '로그인에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('로그인 요청 중 예외 발생:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '로그인 중 오류가 발생했습니다.',
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    username: string,
    phone: string,
    agreements: Agreements,
    phoneVerificationReference?: string
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
          phoneVerificationReference,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // NOTE: 회원가입 성공 후 자동 로그인하지 않는다.
        // UX: "회원가입 완료" 안내 후 사용자가 로그인 페이지에서 로그인하도록 유도.
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
      // localStorage에서 user_auth_id 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_AUTH_ID_KEY);
        console.log('🔍 [AuthContext] 로그아웃 시 user_auth_id 삭제');
      }
      return { success: true };
    } catch {
      return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
    }
  };

  const login = (user: User | UserAuth) => {
    setUser(user);
    sessionStorage.setItem('user', JSON.stringify(user));
    // 사용자 ID를 쿠키에 저장 (API에서 사용)
    document.cookie = `user_id=${user.id}; path=/; max-age=86400`; // 24시간
    // user_auth_id를 localStorage에 저장 (장바구니/결제 페이지에서 사용)
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_AUTH_ID_KEY, user.id);
      console.log(
        '🔍 [AuthContext] login() 호출 시 user_auth_id를 localStorage에 저장:',
        user.id
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, login, signUp, signOut }}
    >
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
