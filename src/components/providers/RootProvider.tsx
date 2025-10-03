"use client";

import { FirebaseAnalyticsProvider } from "./FirebaseAnalyticsProvider";
import { LiffProvider } from "@/components/liff/LiffProvider";

// LIFF ID（環境変数から取得、デフォルト値も設定）
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "your-liff-id-here";

export function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseAnalyticsProvider>
      <LiffProvider liffId={LIFF_ID}>
        {children}
      </LiffProvider>
    </FirebaseAnalyticsProvider>
  );
}