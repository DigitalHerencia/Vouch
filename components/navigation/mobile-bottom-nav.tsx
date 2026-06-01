"use client"

import {
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Plus,
  Shield,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { UserMenu } from "@/components/navigation/user-menu"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { vouchPageCopy } from "@/content/vouches"

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileBottomNav({
  items,
  "aria-label": ariaLabel = "Mobile navigation",
}: MobileBottomNavProps) {
  const pathname = usePathname()
  const [pendingAction, setPendingAction] = useState<ActionItem | null>(null)

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className={`fixed inset-x-0 bottom-0 z-50 grid h-14 w-full items-center border-t border-neutral-400 bg-black px-1 pb-[env(safe-area-inset-bottom)] md:hidden ${
          items.length >= 5 ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.kind === "link" && isActivePath(pathname, item.href)

          const itemClassName = isActive
            ? "flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] leading-none font-semibold text-white uppercase"
            : "flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] leading-none font-semibold text-neutral-400 uppercase"

          const iconClassName = item.primary
            ? "grid size-5 shrink-0 place-items-center text-blue-600"
            : "grid size-5 shrink-0 place-items-center text-white"

          const content = (
            <>
              <span className={iconClassName}>
                {item.kind === "account" ? (
                  <UserMenu size="compact" />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </>
          )

          if (item.kind === "link") {
            return (
              <Link key={item.href} href={item.href} className={itemClassName}>
                {content}
              </Link>
            )
          }

          if (item.kind === "action") {
            return (
              <button
                key={item.label}
                type="button"
                className={itemClassName}
                onClick={() => setPendingAction(item)}
              >
                {content}
              </button>
            )
          }

          return (
            <div key={item.label} className={itemClassName}>
              {content}
            </div>
          )
        })}
      </nav>

      <Drawer
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <DrawerContent>
          <DrawerHeader className="border-b border-neutral-400 text-left">
            <DrawerTitle>{pendingAction?.warning.title}</DrawerTitle>
            <DrawerDescription className="font-semibold">
              {pendingAction?.warning.consequence}
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 p-4">
            <div className="border border-neutral-400 bg-neutral-900 p-3 text-sm font-semibold text-neutral-300">
              {pendingAction?.warning.context}
            </div>
            <p className="text-xs leading-5 font-semibold text-neutral-400">
              {pendingAction?.warning.finePrint}
            </p>
          </div>
          {pendingAction ? (
            <DrawerFooter>
              <form action={pendingAction.action}>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  )
}

const publicItems = [
  { kind: "link", href: "/", label: "Home", icon: Home },
  { kind: "link", href: "/pricing", label: "Price", icon: FileText },
  { kind: "link", href: "/faq", label: "FAQ", icon: HelpCircle },
  { kind: "link", href: "/sign-in", label: "Sign", icon: ShieldCheck },
] satisfies readonly MobileBottomNavItem[]

export function PublicMobileBottomNav() {
  return <MobileBottomNav items={publicItems} aria-label="Public mobile navigation" />
}

export function TenantMobileBottomNav({
  connectAction,
  paymentAction,
}: TenantMobileBottomNavProps) {
  const tenantItems = [
    { kind: "link", href: "/dashboard", label: "Dash", icon: Home },
    {
      kind: "link",
      href: "/vouches/new",
      label: "New",
      icon: Plus,
      primary: true,
    },
    {
      kind: "action",
      label: "Stripe",
      icon: Shield,
      action: connectAction,
      warning: vouchPageCopy.providerRedirects.connect,
    },
    {
      kind: "action",
      label: "Pay",
      icon: CreditCard,
      action: paymentAction,
      warning: vouchPageCopy.providerRedirects.payment,
    },
    { kind: "account", label: "Me", icon: User },
  ] satisfies readonly MobileBottomNavItem[]

  return <MobileBottomNav items={tenantItems} aria-label="Tenant mobile navigation" />
}
