import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricSkeleton() {
    return (
        <Card className="border-cyan-500/20 bg-black">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    );
}
