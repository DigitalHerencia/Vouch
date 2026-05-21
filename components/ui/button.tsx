import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "border-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 border-3 text-sm font-bold tracking-wide whitespace-nowrap uppercase transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        default:
          "bg-primary text-primary-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-background text-foreground hover:bg-muted shadow-[4px_4px_0px_hsl(var(--shadow-color))] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost: "hover:bg-muted hover:border-foreground border-transparent shadow-none",
        link: "text-primary border-transparent underline-offset-4 shadow-none hover:underline",
        nav: "border-transparent bg-transparent text-neutral-300 shadow-none hover:text-white",
        noShadow: "bg-primary text-primary-foreground",
        reverse:
          "bg-primary text-primary-foreground hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_hsl(var(--shadow-color))]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        nav: "h-auto px-0 py-0 text-sm",
      },
      animation: {
        none: "",
        pulse: "animate-[brutal-pulse_2s_ease-in-out_infinite]",
        bounce: "animate-[brutal-bounce_0.5s_ease-in-out_infinite]",
        shake: "hover:animate-[brutal-shake_0.4s_ease-in-out]",
        wiggle: "hover:animate-[brutal-wiggle_0.3s_ease-in-out]",
        pop: "hover:animate-[brutal-pop_0.2s_ease-out] active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
