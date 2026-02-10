// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { createContext, useContext, useEffect, useState } from 'react';

// type AuthContextType = {
//   isLoggedIn: boolean;
//   loading: boolean;
//   login: (token: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType>(null as any);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     const token = await AsyncStorage.getItem('token');
//     setIsLoggedIn(!!token);
//     setLoading(false);
//   };

//   const login = async (token: string) => {
//     await AsyncStorage.setItem('token', token);
//     setIsLoggedIn(true);
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem('token');
//     setIsLoggedIn(false);
//   };

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

/* ================= TYPES ================= */

type LoginSession = {
  id: string;
  device: string;
  country: string;
  time: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>(null as any);

/* ================= PROVIDER ================= */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /* ===== Check Auth ===== */
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  /* ===== Add Login Session ===== */
  const addLoginSession = async () => {
    const device =
      Device.osName === 'Android'
        ? 'Android'
        : Device.osName === 'iOS'
        ? 'iPhone'
        : 'Web / Other';

    // مبدئيًا – جاهز للربط مع IP API لاحقًا
    const country = 'مصر';

    const newSession: LoginSession = {
      id: Date.now().toString(),
      device,
      country,
      time: new Date().toLocaleString(),
    };

    const saved = await AsyncStorage.getItem('loginSessions');
    const sessions: LoginSession[] = saved
      ? JSON.parse(saved)
      : [];

    sessions.unshift(newSession);

    await AsyncStorage.setItem(
      'loginSessions',
      JSON.stringify(sessions)
    );
  };

  /* ===== Login ===== */
  const login = async (token: string) => {
    await AsyncStorage.setItem('token', token);

    // ⬅️ تسجيل جلسة الدخول
    await addLoginSession();

    setIsLoggedIn(true);
  };

  /* ===== Logout ===== */
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export const useAuth = () => useContext(AuthContext);
