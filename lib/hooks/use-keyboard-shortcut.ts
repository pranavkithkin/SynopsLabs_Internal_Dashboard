/**
 * Custom hook for keyboard shortcuts
 * Detects Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */

import { useEffect } from 'react';

interface KeyboardShortcutOptions {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    preventDefault?: boolean;
}

export function useKeyboardShortcut(
    callback: () => void,
    options: KeyboardShortcutOptions
) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const {
                key,
                ctrlKey = false,
                metaKey = false,
                shiftKey = false,
                altKey = false,
                preventDefault = true,
            } = options;

            // Check if the key matches
            if (event.key?.toLowerCase() !== key.toLowerCase()) {
                return;
            }

            // Check modifiers
            if (ctrlKey && !event.ctrlKey) return;
            if (metaKey && !event.metaKey) return;
            if (shiftKey && !event.shiftKey) return;
            if (altKey && !event.altKey) return;

            // For Cmd+K or Ctrl+K, we need either metaKey OR ctrlKey
            if ((ctrlKey || metaKey) && !(event.ctrlKey || event.metaKey)) {
                return;
            }

            if (preventDefault) {
                event.preventDefault();
            }

            callback();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [callback, options]);
}

/**
 * Hook specifically for Cmd+K / Ctrl+K shortcut
 */
export function useCmdK(callback: () => void) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                callback();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [callback]);
}
