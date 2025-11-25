"use client";

import { Check, X } from 'lucide-react';

interface PermissionFeature {
    key: string;
    name: string;
    category: string;
    description: string;
}

interface PermissionMatrixProps {
    features: PermissionFeature[];
    permissions: Record<string, boolean>;
    onChange: (featureKey: string, value: boolean) => void;
}

export function PermissionMatrix({ features, permissions, onChange }: PermissionMatrixProps) {
    // Group features by category
    const categorizedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, PermissionFeature[]>);

    const categoryNames: Record<string, string> = {
        financial: 'Financial Metrics',
        sales: 'Sales Metrics',
        customer: 'Customer Metrics',
        technical: 'Technical Metrics',
        admin: 'Admin Features'
    };

    const categoryColors: Record<string, string> = {
        financial: 'emerald',
        sales: 'blue',
        customer: 'purple',
        technical: 'orange',
        admin: 'cyan'
    };

    return (
        <div className="space-y-6">
            {Object.entries(categorizedFeatures).map(([category, categoryFeatures]) => {
                const color = categoryColors[category] || 'gray';

                return (
                    <div key={category} className="bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden">
                        <div className={`bg-${color}-500/10 border-b border-${color}-500/20 px-6 py-3`}>
                            <h3 className={`text-lg font-semibold text-${color}-400`}>
                                {categoryNames[category] || category}
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-800">
                            {categoryFeatures.map((feature) => {
                                const isGranted = permissions[feature.key] || false;

                                return (
                                    <div
                                        key={feature.key}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-white">
                                                    {feature.name}
                                                </span>
                                                <code className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                                    {feature.key}
                                                </code>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onChange(feature.key, !isGranted)}
                                            className={`
                                                ml-6 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                                ${isGranted
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                                }
                                            `}
                                        >
                                            {isGranted ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Granted</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-4 h-4" />
                                                    <span>Denied</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
