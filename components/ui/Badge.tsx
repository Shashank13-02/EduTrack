import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow hover:shadow-md",
                secondary:
                    "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
                destructive:
                    "border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white shadow",
                outline:
                    "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100",
                success:
                    "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow",
                warning:
                    "border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow",
                info:
                    "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
