"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { Analytics, getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase/config";

type AnalyticsContextType = {
  analytics: Analytics | null;
};

const AnalyticsContext = createContext<AnalyticsContextType>({
  analytics: null,
});

export const useAnalytics = () => useContext(AnalyticsContext);

export function FirebaseAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      setAnalytics(analytics);
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={{ analytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}