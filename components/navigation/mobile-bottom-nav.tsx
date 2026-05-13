// components/navigation/mobile-bottom-nav.tsx

"use client"

import {
    FileText,
    HelpCircle,
    Home,
    Plus,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export interface MobileBottomNavItem {
    href: string
    label: string
    icon: LucideIcon
    primary?: boolean | undefined
}

export interface MobileBottomNavProps {
    items?: readonly MobileBottomNavItem[] | undefined
    className?: string | undefined
    "aria-label"?: string | undefined
}

export const defaultTenantMobileBottomNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/vouches/new", label: "Create", icon: Plus, primary: true },
] satisfies readonly MobileBottomNavItem[]

export const defaultAppMobileBottomNavItems = defaultTenantMobileBottomNavItems

export const defaultPublicMobileBottomNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pricing", label: "Pricing", icon: FileText },
    { href: "/sign-up?return_to=/vouches/new", label: "Create", icon: Plus, primary: true },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/sign-in", label: "Sign in", icon: ShieldCheck },
] satisfies readonly MobileBottomNavItem[]

export function MobileBottomNav({
    items = defaultTenantMobileBottomNavItems,
    className,
    "aria-label": ariaLabel = "Mobile navigation",
}: MobileBottomNavProps) {
    const pathname = usePathname()

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 grid border-t border-neutral-900 bg-black/92 px-2 py-2 backdrop-blur md:hidden",
                items.length >= 5 ? "grid-cols-5" : "grid-cols-4",
                className,
            )}
        >
            {items.map((item) => {
                const Icon = item.icon
                const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 text-[11px] font-semibold text-neutral-500",
                            isActive ? "text-white" : undefined,
                        )}
                    >
                        <span
                            className={cn(
                                "grid place-items-center",
                                item.primary ?
                                    "size-11 bg-primary text-primary-foreground"
                                :   "size-6 text-primary",
                            )}
                        >
                            <Icon className={item.primary ? "size-5" : "size-4"} />
                        </span>
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}

export function AppMobileBottomNav(props: Omit<MobileBottomNavProps, "items">) {
    return (
        <MobileBottomNav
            items={defaultTenantMobileBottomNavItems}
            {...props}
        />
    )
}

export function TenantMobileBottomNav(props: Omit<MobileBottomNavProps, "items">) {
    return (
        <MobileBottomNav
            items={defaultTenantMobileBottomNavItems}
            aria-label="Tenant mobile navigation"
            {...props}
        />
    )
}

export function PublicMobileBottomNav(props: Omit<MobileBottomNavProps, "items">) {
    return (
        <MobileBottomNav
            items={defaultPublicMobileBottomNavItems}
            aria-label="Public mobile navigation"
            {...props}
        />
    )
}
