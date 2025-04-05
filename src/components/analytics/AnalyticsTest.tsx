"use client";

import { useAnalytics } from "@/components/providers/FirebaseAnalyticsProvider";
import { logEvent } from "@/lib/analytics";

export function AnalyticsTest() {
  const { analytics } = useAnalytics();

  const handleTestEvent = () => {
    logEvent(analytics, "test_event", {
      test_param: "test_value",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Analytics Test</h2>
      <button
        onClick={handleTestEvent}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Send Test Event
      </button>
    </div>
  );
}