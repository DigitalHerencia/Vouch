"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = (useTheme().theme ?? "system") as NonNullable<ToasterProps["theme"]>

  return (
    <Sonner
      {...props}
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#000000",
          "--normal-text": "#ffffff",
          "--normal-border": "#404040",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast rounded-none border border-neutral-700 bg-black text-white",
          title: "font-(family-name:--font-display) tracking-wider uppercase",
          description: "text-neutral-400",
          actionButton: "rounded-none bg-primary text-primary-foreground",
          cancelButton: "rounded-none border border-neutral-700 bg-transparent text-white",
        },
      }}
    />
  )
}

export { Toaster }
