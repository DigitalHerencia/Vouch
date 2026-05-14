// components/ui/button.tsx

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center rounded-none bg-clip-padding",
    "font-(family-name:--font-display) leading-none font-normal tracking-[0.08em] whitespace-nowrap uppercase",
    "transition-all duration-[160ms] outline-none select-none",
    "active:not-aria-[haspopup]:translate-y-0",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary text-primary-foreground hover:border-transparent hover:bg-white hover:text-primary aria-expanded:border-transparent aria-expanded:bg-white aria-expanded:text-primary",
        primary:
          "border border-transparent bg-primary text-primary-foreground hover:border-transparent hover:bg-white hover:text-primary aria-expanded:border-transparent aria-expanded:bg-white aria-expanded:text-primary",
        secondary:
          "border border-transparent bg-transparent text-white hover:border-primary hover:bg-transparent hover:text-primary aria-expanded:border-primary aria-expanded:bg-transparent aria-expanded:text-primary",
        outline:
          "border border-transparent bg-transparent text-white hover:border-primary hover:bg-transparent hover:text-primary aria-expanded:border-primary aria-expanded:bg-transparent aria-expanded:text-primary",
        ghost:
          "border border-transparent bg-transparent text-neutral-300 hover:border-transparent hover:bg-neutral-950 hover:text-white aria-expanded:border-transparent aria-expanded:bg-neutral-950 aria-expanded:text-white",
        destructive:
          "border border-red-500/35 bg-red-500/10 text-red-200 hover:border-red-400 hover:bg-red-500/20 hover:text-red-100 focus-visible:border-red-400 focus-visible:ring-red-500/25",
        link:
          "border border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:scale-105 hover:border-transparent hover:bg-transparent hover:text-white hover:underline",
        nav:
          "border border-transparent bg-transparent text-white underline-offset-4 hover:scale-105 hover:border-transparent hover:bg-transparent hover:text-primary hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-4 text-sm sm:text-base [&_svg:not([class*='size-'])]:size-4",
        xs: "h-7 gap-1.5 px-2.5 text-[12px] tracking-[0.07em] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-2 px-3 text-[13px] tracking-[0.075em] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-3 px-5 text-sm sm:text-base [&_svg:not([class*='size-'])]:size-5",
        cta: "h-14.5 gap-6 px-7 text-center text-sm tracking-[0.1em] sm:text-base lg:text-lg [&_svg:not([class*='size-'])]:size-5",
        nav: "h-auto gap-2 px-0 text-sm tracking-[0.1em] sm:text-base lg:text-lg",
        icon: "size-11 p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton ?? !render}
      render={render}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
