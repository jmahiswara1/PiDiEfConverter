import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cx } from "@/lib/utils"

const buttonVariants = {
    base: "inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants: {
        variant: {
            default: "bg-text text-background hover:bg-text/90",
            primary: "bg-accent text-background font-semibold hover:bg-accent-hover shadow-[0_0_20px_rgba(192,132,252,0.3)] hover:shadow-[0_0_30px_rgba(192,132,252,0.5)] transition-all",
            destructive: "bg-error text-white hover:bg-error/90",
            outline: "border border-surface-border bg-background hover:bg-surface hover:text-text",
            secondary: "bg-surface text-text hover:bg-surface-hover",
            ghost: "hover:bg-surface hover:text-text",
            link: "text-accent underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
}

const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Simple variant resolution without cva dependency
        const variantClass = buttonVariants.variants.variant[variant] || buttonVariants.variants.variant.default
        const sizeClass = buttonVariants.variants.size[size] || buttonVariants.variants.size.default

        return (
            <Comp
                className={cx(buttonVariants.base, variantClass, sizeClass, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
