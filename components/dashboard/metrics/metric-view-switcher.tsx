'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, LineChart, GitCompare, Calculator } from 'lucide-react';
import type { ViewMode } from '@/types/metrics';

interface MetricViewSwitcherProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

const views: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { mode: 'card', label: 'Cards', icon: LayoutGrid },
    { mode: 'chart', label: 'Charts', icon: LineChart },
    { mode: 'comparison', label: 'Compare', icon: GitCompare },
    { mode: 'ratio', label: 'Ratios', icon: Calculator },
];

export function MetricViewSwitcher({ currentView, onViewChange }: MetricViewSwitcherProps) {
    return (
        <div className="glass-card rounded-xl p-2 inline-flex gap-2">
            {views.map(({ mode, label, icon: Icon }) => {
                const isActive = currentView === mode;

                return (
                    <button
                        key={mode}
                        onClick={() => onViewChange(mode)}
                        className={`
                            relative px-4 py-2 rounded-lg font-medium text-sm
                            transition-all duration-300 ease-in-out
                            flex items-center gap-2
                            ${isActive
                                ? 'text-white'
                                : 'text-gray-400 hover:text-gray-200'
                            }
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeView"
                                className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/50 rounded-lg cyan-glow"
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                }}
                            />
                        )}
                        <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-cyan-500' : ''}`} />
                        <span className="relative z-10">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
