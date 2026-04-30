import { CalendarDays, Home, Plus, Settings, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

export interface AppMobileBottomNavProps {
  className?: string
}

export function AppMobileBottomNav({ className }: AppMobileBottomNavProps) {
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/vouches", label: "Vouches", icon: CalendarDays },
    { href: "/vouches/new", label: "Create", icon: Plus, primary: true },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/setup", label: "Setup", icon: ShieldCheck },
  ] as const

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-neutral-800 bg-neutral-950/95 px-2 py-2 backdrop-blur md:hidden",
        className
      )}
    >
        {items.map((item) => {
          const Icon = item.icon
          const isPrimary = "primary" in item && item.primary
          return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-[11px] text-neutral-400"
          >
            <span
              className={
                isPrimary
                  ? "grid size-11 place-items-center rounded-full bg-blue-700 text-white"
                  : "grid size-6 place-items-center text-blue-500"
              }
            >
              <Icon className={isPrimary ? "size-5" : "size-4"} />
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
