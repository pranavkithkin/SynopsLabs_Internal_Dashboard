/**
 * Alfred Thinking Indicator
 * Shows loading animation while Alfred is processing
 */

export function AlfredThinking() {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-cyan-500 text-sm font-bold">A</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Alfred is thinking</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
