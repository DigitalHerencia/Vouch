"use client"

type UserMenuProps = { size?: "default" | "sm" | "compact" | "nav" }

// components/auth/user-menu.tsx

import { UserButton } from "@clerk/nextjs"
import { User } from "lucide-react"

export function UserMenu({ size = "default" }: UserMenuProps) {
  const isCompact = size === "compact"
  const isNav = size === "nav"
  const triggerSize = isNav ? "size-5" : isCompact ? "size-9" : "size-11"
  const avatarSize = isNav ? "size-5" : isCompact ? "size-8" : "size-10"

  const userButton = (
    <UserButton
      appearance={{
        elements: {
          userButtonTrigger: [
            triggerSize,
            isNav
              ? "!size-5 !min-h-0 !min-w-0 !rounded-none !border-0 !bg-transparent !p-0"
              : "grid place-items-center rounded-none border border-neutral-400 bg-black",
            "transition-colors hover:border-blue-600 hover:bg-black",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          ].join(" "),
          userButtonAvatarBox: [
            avatarSize,
            isNav
              ? "!size-5 !rounded-none !border-0 !bg-transparent opacity-0"
              : "rounded-none border border-neutral-400 bg-blue-600",
          ].join(" "),
          avatarBox: [
            avatarSize,
            isNav
              ? "!size-5 !rounded-none !border-0 !bg-transparent opacity-0"
              : "rounded-none border border-neutral-400 bg-blue-600",
          ].join(" "),
          userButtonPopoverCard:
            "rounded-none border border-neutral-400 bg-black text-white shadow-[8px_8px_0_0_oklch(54.6% 0.245 262.881 / 0.24)]",
          userPreviewMainIdentifier:
            "font-(family-name:--font-display) text-sm tracking-[0.06em] uppercase text-white",
          userPreviewSecondaryIdentifier: "font-mono text-xs text-neutral-400",
          userButtonPopoverActionButton:
            "rounded-none text-white hover:bg-blue-600 hover:text-white",
          userButtonPopoverActionButtonText:
            "font-(family-name:--font-display) text-[13px] tracking-[0.06em] uppercase",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  )

  if (isNav) {
    return (
      <span className="relative grid size-5 place-items-center">
        {userButton}
        <User aria-hidden="true" className="pointer-events-none absolute size-5 text-white" />
      </span>
    )
  }

  return userButton
}
