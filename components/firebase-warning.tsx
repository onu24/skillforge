'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FirebaseWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const isConfigured = 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!isConfigured) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-950 text-red-100 p-4">
      <Alert className="border-red-800 bg-red-950">
        <AlertDescription>
          <strong>Firebase not configured:</strong> Please set your Firebase environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.) in your project settings to enable authentication and data storage.
        </AlertDescription>
      </Alert>
    </div>
  );
}
