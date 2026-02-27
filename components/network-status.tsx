'use client';

import { useState, useEffect } from 'react';
import { WifiOff, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Wait a bit before hiding the alert so user can see it's back
            setTimeout(() => setIsVisible(false), 3000);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) {
            setIsOnline(false);
            setIsVisible(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5">
            <div className={`
        flex items-center gap-4 p-4 rounded-lg shadow-2xl border 
        ${isOnline
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-[#F44336] border-[#d32f2f] text-white'}
      `}>
                <div className="flex-shrink-0">
                    {isOnline ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <WifiOff className="w-5 h-5" />
                    )}
                </div>

                <div className="flex-1">
                    <p className="font-semibold text-sm">
                        {isOnline ? 'Connection Restored!' : 'Network connection lost'}
                    </p>
                    {!isOnline && (
                        <p className="text-xs opacity-90">Please check your internet settings.</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!isOnline && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.location.reload()}
                            className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-white/40"
                        >
                            Retry
                        </Button>
                    )}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
