'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Start loading on route change
        setLoading(true);
        setProgress(0);

        const startLoading = async () => {
            // Step 1: Jump to 30% after 200ms
            await new Promise(resolve => setTimeout(resolve, 200));
            setProgress(30);

            // Step 2: Increment to 70% after another 300ms (total 500ms)
            await new Promise(resolve => setTimeout(resolve, 300));
            setProgress(70);

            // Step 3: Complete loading
            // In a real app, this would be tied to actual page load events if possible,
            // but for Next.js app router client-side transitions, we simulate completion
            // since the layout/component mounting is practically the end of the transition.
            await new Promise(resolve => setTimeout(resolve, 100)); // Slight delay for feel
            setProgress(100);

            // Give it time to show 100% before fading out
            await new Promise(resolve => setTimeout(resolve, 200));
            setLoading(false);
        };

        startLoading();

        return () => {
            // Cleanup if needed
        };
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-background pointer-events-none overflow-hidden"
                >
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 50,
                            damping: 20,
                            mass: 1
                        }}
                        className="h-full bg-gradient-to-r from-[#00BCD4] to-[#0097A7] shadow-[0_0_8px_rgba(0,188,212,0.6)]"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
