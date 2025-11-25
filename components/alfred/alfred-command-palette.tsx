/**
 * Alfred Command Palette
 * Main component for Alfred AI assistant
 * Opens with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 */

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlfred } from '@/lib/hooks/use-alfred';
import { useCmdK } from '@/lib/hooks/use-keyboard-shortcut';
import { usePermissions } from '@/lib/permissions';
import { AlfredMessageComponent } from './alfred-message';
import { AlfredInput } from './alfred-input';
import { AlfredThinking } from './alfred-thinking';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles } from 'lucide-react';

export function AlfredCommandPalette() {
    const { hasPermission } = usePermissions();
    const {
        messages,
        isLoading,
        isOpen,
        openAlfred,
        closeAlfred,
        sendMessage,
        clearConversation,
    } = useAlfred();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check if user has permission to use Alfred
    const canUseAlfred = hasPermission('alfred.chat');

    // Setup Cmd+K / Ctrl+K shortcut
    useCmdK(() => {
        if (canUseAlfred) {
            if (isOpen) {
                closeAlfred();
            } else {
                openAlfred();
            }
        }
    });

    // Setup ESC key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeAlfred();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeAlfred]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Don't render if user doesn't have permission
    if (!canUseAlfred) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={closeAlfred}
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[600px] bg-black border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between bg-black">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                    <Sparkles className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Alfred AI</h2>
                                    <p className="text-xs text-gray-400">Your intelligent assistant</p>
                                </div>
                            </div>

                            {/* Clear Conversation Button */}
                            {messages.length > 0 && (
                                <Button
                                    onClick={clearConversation}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 px-6 py-4">
                            {messages.length === 0 && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-cyan-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Hi! I'm Alfred
                                    </h3>
                                    <p className="text-gray-400 max-w-md">
                                        I'm your AI assistant. I can help you with tasks, metrics, scheduling, and more.
                                        Just ask me anything!
                                    </p>
                                    <div className="mt-6 space-y-2 text-sm text-gray-500">
                                        <p>Try asking:</p>
                                        <ul className="space-y-1 text-cyan-400">
                                            <li>"What's our MRR this month?"</li>
                                            <li>"Create a task to review Q4 metrics"</li>
                                            <li>"Schedule a team meeting tomorrow at 2pm"</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <AlfredMessageComponent key={index} message={message} />
                            ))}

                            {isLoading && <AlfredThinking />}

                            <div ref={messagesEndRef} />
                        </ScrollArea>

                        {/* Input Area */}
                        <AlfredInput onSend={sendMessage} disabled={isLoading} autoFocus />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
