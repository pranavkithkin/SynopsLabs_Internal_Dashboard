/**
 * KPI Goal Setter Component
 * Modal dialog for setting KPI targets
 */

'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSetKPIGoal } from '@/lib/hooks/use-kpis';
import { PermissionGate } from '@/lib/permissions';
import type { KPIMetric, KPITimePeriod, KPICategory } from '@/types/kpi';
import { PERIOD_LABELS } from '@/types/kpi';
import { Target, Loader2 } from 'lucide-react';

interface KPIGoalSetterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kpis: KPIMetric[];
    selectedKPI?: KPIMetric;
    defaultPeriod?: KPITimePeriod;
}

export function KPIGoalSetter({
    open,
    onOpenChange,
    kpis,
    selectedKPI,
    defaultPeriod = 'monthly',
}: KPIGoalSetterProps) {
    const [selectedKPIId, setSelectedKPIId] = useState<string>(selectedKPI?.id || '');
    const [targetValue, setTargetValue] = useState<string>('');
    const [period, setPeriod] = useState<KPITimePeriod>(defaultPeriod);
    const [notes, setNotes] = useState<string>('');

    const { mutate: setGoal, isPending } = useSetKPIGoal();

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setSelectedKPIId(selectedKPI?.id || '');
            setTargetValue('');
            setNotes('');
        }
        onOpenChange(newOpen);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedKPIId) {
            toast.error('Please select a KPI');
            return;
        }

        const target = parseFloat(targetValue);
        if (isNaN(target) || target <= 0) {
            toast.error('Please enter a valid target value');
            return;
        }

        setGoal(
            {
                kpi_id: selectedKPIId,
                target_value: target,
                period,
                notes: notes || undefined,
            },
            {
                onSuccess: () => {
                    toast.success('KPI goal set successfully');
                    handleOpenChange(false);
                },
                onError: (error) => {
                    toast.error(`Failed to set goal: ${error.message}`);
                },
            }
        );
    };

    const selectedKPIData = kpis.find(k => k.id === selectedKPIId);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-black border-cyan-500/30 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Target className="h-5 w-5 text-cyan-500" />
                        Set KPI Goal
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Define a target value for a specific KPI and time period
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* KPI Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="kpi" className="text-gray-300">
                            Select KPI
                        </Label>
                        <Select
                            value={selectedKPIId}
                            onValueChange={setSelectedKPIId}
                            disabled={!!selectedKPI}
                        >
                            <SelectTrigger
                                id="kpi"
                                className="bg-gray-900 border-cyan-500/20 text-white"
                            >
                                <SelectValue placeholder="Choose a KPI..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-cyan-500/30 text-white">
                                {kpis.map((kpi) => (
                                    <SelectItem key={kpi.id} value={kpi.id}>
                                        {kpi.name} ({kpi.category})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Value Display */}
                    {selectedKPIData && (
                        <div className="bg-gray-900 border border-cyan-500/20 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Current Value</p>
                            <p className="text-lg font-semibold text-white">
                                {selectedKPIData.unit === '$' && 'AED'}
                                {selectedKPIData.current_value.toLocaleString()}
                                {selectedKPIData.unit === '%' && '%'}
                            </p>
                        </div>
                    )}

                    {/* Target Value */}
                    <div className="space-y-2">
                        <Label htmlFor="target" className="text-gray-300">
                            Target Value
                        </Label>
                        <Input
                            id="target"
                            type="number"
                            step="any"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            placeholder="Enter target value..."
                            className="bg-gray-900 border-cyan-500/20 text-white placeholder:text-gray-500"
                            required
                        />
                    </div>

                    {/* Time Period */}
                    <div className="space-y-2">
                        <Label htmlFor="period" className="text-gray-300">
                            Time Period
                        </Label>
                        <Select
                            value={period}
                            onValueChange={(v: string) => setPeriod(v as KPITimePeriod)}
                        >
                            <SelectTrigger
                                id="period"
                                className="bg-gray-900 border-cyan-500/20 text-white"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-cyan-500/30 text-white">
                                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-gray-300">
                            Notes <span className="text-gray-500">(optional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            placeholder="Add any notes about this goal..."
                            className="bg-gray-900 border-cyan-500/20 text-white placeholder:text-gray-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="border-gray-500/30 text-gray-400 hover:bg-gray-900"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-cyan-500 text-black hover:bg-cyan-600"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Set Goal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
