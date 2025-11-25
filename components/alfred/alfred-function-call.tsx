/**
 * Alfred Function Call Display
 * Shows function execution status and results
 */

import type { FunctionCall } from '@/types/alfred';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface AlfredFunctionCallProps {
    functionCall: FunctionCall;
    isLoading?: boolean;
}

export function AlfredFunctionCall({ functionCall, isLoading = false }: AlfredFunctionCallProps) {
    const { name, arguments: args, result } = functionCall;

    // Format function name for display
    const displayName = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="mt-2 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-start gap-2">
                {/* Status Icon */}
                {isLoading && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin mt-0.5" />}
                {!isLoading && result?.success && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
                {!isLoading && result && !result.success && <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}

                <div className="flex-1">
                    {/* Function Name */}
                    <div className="text-sm font-medium text-cyan-400">
                        {isLoading ? `${displayName}...` : displayName}
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div
                            className={`text-sm mt-1 ${result.success ? 'text-green-400' : 'text-red-400'
                                }`}
                        >
                            {result.message}
                        </div>
                    )}

                    {/* Arguments (collapsed by default) */}
                    {Object.keys(args).length > 0 && (
                        <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                                View details
                            </summary>
                            <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">
                                {JSON.stringify(args, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}
