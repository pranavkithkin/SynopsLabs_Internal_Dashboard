import * as React from "react"
import { cn } from "@/lib/utils"

export interface BulletProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info"
    size?: "sm" | "md" | "lg"
}

const Bullet = React.forwardRef<HTMLSpanElement, BulletProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        const variants = {
            default: "bg-gray-400",
            success: "bg-green-500",
            warning: "bg-yellow-500",
            error: "bg-red-500",
            info: "bg-blue-500",
        }

        const sizes = {
            sm: "h-1.5 w-1.5",
            md: "h-2 w-2",
            lg: "h-2.5 w-2.5",
        }

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-block rounded-full",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Bullet.displayName = "Bullet"

export { Bullet }
