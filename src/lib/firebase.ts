import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics
let analytics: Analytics | null = null;

// Function to initialize analytics
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && !analytics) {
    try {
      const isAnalyticsSupported = await isSupported();
      if (isAnalyticsSupported) {
        analytics = getAnalytics(firebaseApp);
        return analytics;
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }
  return null;
};

export { firebaseApp, analytics };
