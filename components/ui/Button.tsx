import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-violet-700 dark:from-blue-500 dark:to-violet-500",
                destructive:
                    "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow hover:from-red-700 hover:to-rose-700",
                outline:
                    "border-2 border-indigo-200 bg-transparent hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:border-indigo-700",
                secondary:
                    "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-900 hover:from-violet-200 hover:to-purple-200 dark:from-violet-900 dark:to-purple-900 dark:text-violet-100",
                ghost:
                    "hover:bg-indigo-50 hover:text-indigo-900 dark:hover:bg-indigo-950 dark:hover:text-indigo-100",
                link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-12 rounded-xl px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
