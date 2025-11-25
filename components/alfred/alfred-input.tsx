/**
 * Alfred Input Component
 * Text input for sending messages to Alfred
 */

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlfredInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function AlfredInput({ onSend, disabled = false, autoFocus = true }: AlfredInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter to send, Shift+Enter for new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-cyan-500/20 p-4 bg-black">
            <div className="flex gap-2 items-end">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Ask Alfred anything... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 bg-gray-900 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none min-h-[48px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Esc</kbd> to close
            </div>
        </div>
    );
}
