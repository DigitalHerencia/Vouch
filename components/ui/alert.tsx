import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full animate-in border-3 border-neutral-400 p-4 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)] transition-all duration-300 fade-in-0 slide-in-from-top-2 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-white [&>svg+div]:translate-y-[-3px] [&>svg~*:not([data-alert-action])]:pl-8 [&>svg~[data-alert-action]]:ml-8",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        destructive: "bg-red-600 text-white [&>svg]:text-white",
        success: "bg-blue-600 text-white",
        warning: "bg-blue-600 text-white",
        info: "bg-blue-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 leading-none font-bold tracking-wide uppercase", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export interface AlertActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows an inline spinner and disables the button automatically */
  loading?: boolean
}

const AlertAction = React.forwardRef<HTMLButtonElement, AlertActionProps>(
  ({ className, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      data-alert-action=""
      disabled={disabled || loading}
      className={cn(
        // layout
        "mt-3 inline-flex max-w-full min-w-0 items-center gap-1.5",
        // shape — no rounded corners, thin border inheriting text color
        "rounded-none border border-neutral-400",
        // typography
        "px-4 py-1 text-xs font-bold tracking-wide uppercase",
        // transitions
        "transition-all duration-150",
        // hover
        "hover:bg-blue-600/10 hover:opacity-100",
        // active
        "active:scale-95",
        // focus
        "focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 focus-visible:outline-none",
        // cursor + pointer-events when non-interactive
        "disabled:pointer-events-none disabled:cursor-not-allowed",
        // opacity: loading stays visible, truly-disabled fades out, default is 80%
        loading ? "opacity-80" : disabled ? "opacity-40" : "opacity-80",
        className
      )}
      {...props}
    >
      {loading && (
        <span
          data-testid="alert-action-spinner"
          aria-hidden="true"
          className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-neutral-400 border-t-blue-600"
        />
      )}
      <span className="inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
        {children}
      </span>
    </button>
  )
)
AlertAction.displayName = "AlertAction"

export { Alert, AlertTitle, AlertDescription, AlertAction }
