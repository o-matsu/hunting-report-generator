'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import liff from '@line/liff';
import { LiffUser, LiffContext } from '@/types/liff';

interface LiffProviderContextType {
  isLiffReady: boolean;
  isLoggedIn: boolean;
  user: LiffUser | null;
  liffContext: LiffContext | null;
  login: () => void;
  logout: () => void;
}

const LiffProviderContext = createContext<LiffProviderContextType | undefined>(undefined);

interface LiffProviderProps {
  children: ReactNode;
  liffId: string;
}

export const LiffProvider: React.FC<LiffProviderProps> = ({ children, liffId }) => {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<LiffUser | null>(null);
  const [liffContext, setLiffContext] = useState<LiffContext | null>(null);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // LIFF初期化
        await liff.init({ liffId });
        console.log('LIFF initialized successfully');

        // ログイン状態をチェック
        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          // ユーザー情報を取得
          const profile = await liff.getProfile();
          console.log('LIFF Profile:', profile);

          const userInfo: LiffUser = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
          };
          setUser(userInfo);

          // コンテキスト情報を取得
          const context = liff.getContext();
          console.log('LIFF Context:', context);
          setLiffContext(context);
        } else {
          console.log('User is not logged in');
        }

        setIsLiffReady(true);
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setIsLiffReady(true); // エラーでもready状態にする
      }
    };

    initializeLiff();
  }, [liffId]);

  const login = () => {
    if (liff.isLoggedIn()) {
      console.log('User is already logged in');
      return;
    }
    liff.login();
  };

  const logout = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
      setIsLoggedIn(false);
      setUser(null);
      setLiffContext(null);
      console.log('User logged out');
    }
  };

  const contextValue: LiffProviderContextType = {
    isLiffReady,
    isLoggedIn,
    user,
    liffContext,
    login,
    logout,
  };

  return (
    <LiffProviderContext.Provider value={contextValue}>
      {children}
    </LiffProviderContext.Provider>
  );
};

export const useLiff = (): LiffProviderContextType => {
  const context = useContext(LiffProviderContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
};
