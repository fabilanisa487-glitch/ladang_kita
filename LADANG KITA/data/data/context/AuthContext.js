'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  apiRegister,
  apiLogin,
  apiEnrollSecurityQuestion,
  apiLogout,
  apiMe,
  apiForgot,
  apiVerifySecurityAnswer,
  apiResetPassword,
  apiRecoverEmailRequest,
  apiRecoverEmailVerify,
} from '@/lib/authClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bersihkan data sesi localStorage/sessionStorage lama saat aplikasi dimuat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const staleKeys = [
        'ladang_user',
        'ladang_users',
        'ladang_user_session',
        'ladang_auth_otp',
      ];
      for (const key of staleKeys) {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {
          // Abaikan error akses storage
        }
      }
    }

    let active = true;
    apiMe()
      .then((res) => {
        if (active) setUser(res.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const register = async (name, email, password, phone = '', securityQuestion, securityAnswer) => {
    const res = await apiRegister({
      name,
      email,
      password,
      phone,
      securityQuestion,
      securityAnswer,
    });
    if (res.success && res.user && !res.requiresSecuritySetup) {
      setUser(res.user);
    }
    return res;
  };

  const completeSecuritySetup = async (question, answer) => {
    const res = await apiEnrollSecurityQuestion({ question, answer });
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const login = async (email, password, remember = true, captcha) => {
    const res = await apiLogin({ email, password, remember, captcha });
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const requestPasswordReset = async (email) => {
    return apiForgot({ email });
  };

  const verifySecurityAnswer = async (email, answer) => {
    return apiVerifySecurityAnswer({ email, answer });
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    return apiResetPassword({ email, resetToken, newPassword });
  };

  const requestEmailRecovery = async (phone, name) => {
    return apiRecoverEmailRequest({ phone, name });
  };

  const verifyEmailRecovery = async (phone, code) => {
    return apiRecoverEmailVerify({ phone, code });
  };

  const updateProfile = async () => {
    if (!user) return { success: false, error: 'Silakan masuk kembali.' };
    return { success: false, error: 'Fitur pembaruan profil belum tersedia.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        completeSecuritySetup,
        logout,
        updateProfile,
        requestPasswordReset,
        verifySecurityAnswer,
        resetPassword,
        requestEmailRecovery,
        verifyEmailRecovery,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
}
