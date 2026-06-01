import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  FileQuestion,
  Search,
  Inbox,
  FolderOpen,
  Users,
  ShoppingCart,
  Bell,
  Image as ImageIcon,
  AlertTriangle,
  WifiOff,
  ShieldX,
  Clock,
  Wrench,
  Upload,
} from "lucide-react"

// ============================================================================
// Empty State Root
// ============================================================================

const emptyStateVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      default: "",
      filled: "border-3 border-dashed border-neutral-400 bg-neutral-900 p-8",
      card: "border-3 border-neutral-400 bg-black p-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]",
    },
    size: {
      compact: "gap-2 p-2",
      sm: "gap-3 p-4",
      md: "gap-4 p-6",
      lg: "gap-6 p-8",
    },
    layout: {
      vertical: "flex-col text-center",
      horizontal: "flex-row text-left",
    },
    animation: {
      none: "",
      fadeIn: "animate-[fadeIn_0.3s_ease-out]",
      bounce: "animate-[bounceIn_0.5s_ease-out]",
      scale: "animate-[scaleIn_0.3s_ease-out]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    layout: "vertical",
    animation: "none",
  },
})

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, size, layout, animation, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, layout, animation }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

// ============================================================================
// Empty State Icon
// ============================================================================

const iconContainerVariants = cva(
  "flex items-center justify-center border-3 border-neutral-400 shadow-[3px_3px_0px_oklch(54.6%_0.245_262.881)]",
  {
    variants: {
      size: {
        xs: "h-10 w-10",
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-20 w-20",
        xl: "h-24 w-24",
      },
      iconColor: {
        default: "bg-neutral-900 text-white",
        primary: "bg-blue-600 text-white",
        secondary: "bg-neutral-900 text-white",
        accent: "bg-blue-600 text-white",
        muted: "bg-neutral-900 text-neutral-400",
        destructive: "bg-red-600 text-white",
        warning: "bg-blue-600 text-white",
        success: "bg-blue-600 text-white",
      },
    },
    defaultVariants: {
      size: "md",
      iconColor: "default",
    },
  }
)

const iconSizeMap = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
}

const EmptyStateIcon = React.forwardRef<HTMLDivElement, EmptyStateIconProps>(
  ({ className, size, iconColor, iconSize, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(iconContainerVariants({ size, iconColor }), className)}
        {...props}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
              className: cn(
                iconSizeMap[iconSize ?? size ?? "md"],
                (children as React.ReactElement<{ className?: string }>).props.className
              ),
            })
          : children}
      </div>
    )
  }
)
EmptyStateIcon.displayName = "EmptyStateIcon"

const EmptyStateIllustration = React.forwardRef<HTMLDivElement, EmptyStateIllustrationProps>(
  ({ className, maxWidth = "200px", children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        style={{ maxWidth, ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EmptyStateIllustration.displayName = "EmptyStateIllustration"

const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-black tracking-wide uppercase", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
EmptyStateTitle.displayName = "EmptyStateTitle"

const EmptyStateDescription = React.forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("max-w-sm font-medium text-neutral-400", className)} {...props}>
        {children}
      </p>
    )
  }
)
EmptyStateDescription.displayName = "EmptyStateDescription"

const EmptyStateActions = React.forwardRef<HTMLDivElement, EmptyStateActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-2 flex flex-wrap items-center justify-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EmptyStateActions.displayName = "EmptyStateActions"

const presetConfig: Record<EmptyStatePresetType, PresetConfig> = {
  "no-results": {
    icon: <Search />,
    title: "No results found",
    description: "Try adjusting your search or filter to find what you're looking for.",
  },
  "no-data": {
    icon: <FileQuestion />,
    title: "No data available",
    description: "There's nothing to display here yet. Data will appear once available.",
  },
  "empty-inbox": {
    icon: <Inbox />,
    title: "Inbox is empty",
    description: "You're all caught up! New messages will appear here.",
  },
  "empty-folder": {
    icon: <FolderOpen />,
    title: "Folder is empty",
    description: "This folder doesn't contain any files yet.",
  },
  "no-users": {
    icon: <Users />,
    title: "No users found",
    description: "There are no users matching your criteria.",
  },
  "empty-cart": {
    icon: <ShoppingCart />,
    title: "Your cart is empty",
    description: "Looks like you haven't added anything to your cart yet.",
  },
  "no-notifications": {
    icon: <Bell />,
    title: "No notifications",
    description: "You're all caught up! Check back later for updates.",
  },
  "no-images": {
    icon: <ImageIcon />,
    title: "No images",
    description: "There are no images to display. Upload some to get started.",
  },
  // New presets
  error: {
    icon: <AlertTriangle />,
    title: "Something went wrong",
    description: "An error occurred. Please try again or contact support if the problem persists.",
    iconColor: "destructive",
  },
  offline: {
    icon: <WifiOff />,
    title: "You're offline",
    description: "Please check your internet connection and try again.",
    iconColor: "warning",
  },
  "permission-denied": {
    icon: <ShieldX />,
    title: "Access denied",
    description: "You don't have permission to view this content.",
    iconColor: "destructive",
  },
  "coming-soon": {
    icon: <Clock />,
    title: "Coming soon",
    description: "This feature is under development. Stay tuned for updates!",
    iconColor: "accent",
  },
  maintenance: {
    icon: <Wrench />,
    title: "Under maintenance",
    description: "We're performing scheduled maintenance. Please check back soon.",
    iconColor: "warning",
  },
  upload: {
    icon: <Upload />,
    title: "Upload files",
    description: "Drag and drop files here, or click to browse.",
    iconColor: "primary",
  },
}

const EmptyStatePreset = React.forwardRef<HTMLDivElement, EmptyStatePresetProps>(
  (
    {
      preset,
      action,
      customTitle,
      customDescription,
      customIcon,
      illustration,
      iconColor,
      iconSize,
      size,
      layout,
      variant,
      animation,
      className,
      ...props
    },
    ref
  ) => {
    const config = presetConfig[preset]
    const finalIconColor = iconColor ?? config.iconColor ?? "default"

    return (
      <EmptyState
        ref={ref}
        variant={variant}
        size={size}
        layout={layout}
        animation={animation}
        className={className}
        {...props}
      >
        {illustration ? (
          <EmptyStateIllustration>{illustration}</EmptyStateIllustration>
        ) : (
          <EmptyStateIcon
            iconColor={finalIconColor}
            size={
              iconSize ??
              (size === "compact" ? "sm" : size === "sm" ? "sm" : size === "lg" ? "lg" : "md")
            }
          >
            {customIcon ?? config.icon}
          </EmptyStateIcon>
        )}
        <div className={cn(layout === "horizontal" && "flex flex-col")}>
          <EmptyStateTitle>{customTitle ?? config.title}</EmptyStateTitle>
          <EmptyStateDescription>{customDescription ?? config.description}</EmptyStateDescription>
          {action && <EmptyStateActions>{action}</EmptyStateActions>}
        </div>
      </EmptyState>
    )
  }
)
EmptyStatePreset.displayName = "EmptyStatePreset"

// ============================================================================
// Exports
// ============================================================================

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateIllustration,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  EmptyStatePreset,
  emptyStateVariants,
  iconContainerVariants,
}
