import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border-3 border-neutral-400 font-(family-name:--font-brand) text-base leading-none font-black tracking-wide whitespace-nowrap uppercase transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white shadow-[4px_4px_0px_oklch(0%_0_0)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-black text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        link: "border-none text-white shadow-none hover:scale-110 hover:text-blue-600 hover:underline hover:underline-offset-4",
        nav: "border-none text-white shadow-none hover:scale-110 hover:text-blue-600 hover:underline hover:underline-offset-4",
        destructive:
          "bg-red-600 text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost:
          "border-none bg-transparent text-white shadow-none hover:text-blue-600 hover:underline hover:underline-offset-4",
        primary:
          "bg-blue-600 text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "bg-black text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        accent:
          "bg-neutral-400 text-blue-600 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        noShadow: "bg-blue-600 text-white",
        reverse:
          "bg-blue-600 text-white hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_oklch(54.6%_0.245_262.811)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        nav: "h-auto px-0 py-0 text-base",
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
      variant: "outline",
      size: "lg",
      animation: "none",
    },
  }
)

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
