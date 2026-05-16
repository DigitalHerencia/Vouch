// components/auth/user-menu.tsx

"use client"

import { UserButton } from "@clerk/nextjs"

export type UserMenuProps = Readonly<{
  size?: "default" | "compact"
}>

export function UserMenu({ size = "default" }: UserMenuProps) {
  const isCompact = size === "compact"
  const triggerSize = isCompact ? "size-9" : "size-11"
  const avatarSize = isCompact ? "size-8" : "size-10"

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonTrigger: [
            triggerSize,
            "grid place-items-center rounded-none border border-neutral-700 bg-black",
            "transition-colors hover:border-blue-700 hover:bg-neutral-950",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700",
          ].join(" "),
          userButtonAvatarBox: [
            avatarSize,
            "rounded-none border border-neutral-800 bg-blue-700",
          ].join(" "),
          avatarBox: [avatarSize, "rounded-none border border-neutral-800 bg-blue-700"].join(" "),
          userButtonPopoverCard:
            "rounded-none border border-neutral-700 bg-black text-neutral-100 shadow-[8px_8px_0_0_rgba(29,78,216,0.24)]",
          userPreviewMainIdentifier:
            "font-(family-name:--font-display) text-sm tracking-[0.06em] uppercase text-white",
          userPreviewSecondaryIdentifier: "font-mono text-xs text-neutral-500",
          userButtonPopoverActionButton:
            "rounded-none text-neutral-200 hover:bg-blue-700 hover:text-white",
          userButtonPopoverActionButtonText:
            "font-(family-name:--font-display) text-[13px] tracking-[0.06em] uppercase",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  )
}
