'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineDetector() {
    const [isOnline, setIsOnline] = useState(true);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            // Hide reconnected message after 3 seconds
            setTimeout(() => setShowReconnected(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {(!isOnline || showReconnected) && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 left-0 right-0 z-50"
                >
                    <div
                        className={`px-4 py-3 text-center text-sm font-medium ${isOnline
                                ? 'bg-green-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            {isOnline ? (
                                <>
                                    <Wifi className="w-4 h-4" />
                                    <span>You're back online!</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4" />
                                    <span>You're offline. Some features may not work.</span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
