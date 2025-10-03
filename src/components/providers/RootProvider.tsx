"use client";

import { FirebaseAnalyticsProvider } from "./FirebaseAnalyticsProvider";

export function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseAnalyticsProvider>
      {children}
    </FirebaseAnalyticsProvider>
  );
}