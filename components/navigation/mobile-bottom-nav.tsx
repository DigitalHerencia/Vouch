// components/navigation/mobile-bottom-nav.tsx

"use client"

import {
    CreditCard,
    FileText,
    HelpCircle,
    Home,
    Plus,
    Shield,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { ProtocolDrawer } from "@/components/vouches/protocol-drawer"
import { vouchPageCopy } from "@/content/vouches"
import { cn } from "@/lib/utils"

export interface MobileBottomNavItem {
    href?: string | undefined
    label: string
    icon: LucideIcon
    action?: ((formData: FormData) => void | Promise<void>) | undefined
    warning?: {
        title: string
        consequence: string
        context: string
        finePrint: string
    } | undefined
    account?: boolean | undefined
    primary?: boolean | undefined
}

export interface MobileBottomNavProps {
    items?: readonly MobileBottomNavItem[] | undefined
    className?: string | undefined
    "aria-label"?: string | undefined
}

export interface TenantMobileBottomNavProps extends Omit<MobileBottomNavProps, "items"> {
    connectAction: (formData: FormData) => void | Promise<void>
    paymentAction: (formData: FormData) => void | Promise<void>
}

export const defaultTenantMobileBottomNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/vouches/new", label: "Vouches", icon: FileText },
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
    const [warning, setWarning] = useState<MobileBottomNavItem | null>(null)

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 grid min-h-18 items-stretch border-t border-neutral-900 bg-black/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden",
                items.length >= 5 ? "grid-cols-5" : "grid-cols-4",
                className,
            )}
        >
            {items.map((item) => {
                const Icon = item.icon
                const isActive =
                    item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false
                const content = (
                    <>
                        <span
                            className={cn(
                                "grid size-8 place-items-center",
                                item.primary ?
                                    "bg-primary text-primary-foreground"
                                :   "text-primary",
                            )}
                        >
                            {item.account ? <UserMenu size="compact" /> : <Icon className="size-5" />}
                        </span>
                        {item.label}
                    </>
                )

                const className = cn(
                    "flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold leading-none tracking-[0.04em] text-neutral-500 uppercase",
                    isActive ? "text-white" : undefined,
                )

                return item.account ? (
                    <div key={item.label} className={className}>
                        {content}
                    </div>
                ) : item.action ? (
                    <form key={item.label} action={item.action} className="min-w-0">
                        <button
                            type={item.warning ? "button" : "submit"}
                            className={className}
                            onClick={item.warning ? () => setWarning(item) : undefined}
                        >
                            {content}
                        </button>
                    </form>
                ) : (
                    <Link
                        key={item.href}
                        href={item.href ?? "/dashboard"}
                        className={className}
                    >
                        {content}
                    </Link>
                )
            })}
            {warning?.warning && warning.action ? (
                <ProtocolDrawer
                    open
                    onOpenChange={(nextOpen) => {
                        if (!nextOpen) setWarning(null)
                    }}
                    title={warning.warning.title}
                    consequence={warning.warning.consequence}
                    context={warning.warning.context}
                    finePrint={warning.warning.finePrint}
                    primary={
                        <form action={warning.action}>
                            <Button type="submit" className="w-full">
                                Continue to provider
                            </Button>
                        </form>
                    }
                />
            ) : null}
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

export function TenantMobileBottomNav({
    connectAction,
    paymentAction,
    ...props
}: TenantMobileBottomNavProps) {
    const configuredItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/vouches/new", label: "Vouches", icon: FileText },
        {
            label: "Connect",
            icon: Shield,
            action: connectAction,
            warning: vouchPageCopy.providerRedirects.connect,
        },
        {
            label: "Payment",
            icon: CreditCard,
            action: paymentAction,
            warning: vouchPageCopy.providerRedirects.payment,
        },
        { label: "Account", icon: Home, account: true },
    ] satisfies MobileBottomNavItem[]

    const tenantItems = configuredItems.filter((item) =>
        Boolean(item.href || item.action || item.account)
    )

    return (
        <MobileBottomNav
            items={tenantItems}
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
