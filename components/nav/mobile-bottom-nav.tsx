"use client"

import {
  FileText,
  HelpCircle,
  Home,
  Plus,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { UserMenu } from "@/components/nav/user-menu"
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
  const [pendingAction, setPendingAction] = useState<MobileBottomNavItem | null>(null)
  const returnPath = pathname === "/vouches/new" ? "/vouches/new" : "/dashboard"

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
          const isActive = item.kind === "link" && !!item.href && isActivePath(pathname, item.href)

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
                ) : Icon ? (
                  <Icon className="size-4" />
                ) : null}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </>
          )

          if (item.kind === "link" && item.href) {
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
                onClick={() => (item.action ? setPendingAction(item) : undefined)}
                disabled={!item.action}
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
          <DrawerHeader className="gap-3 border-b border-neutral-400 px-5 pt-8 pb-5 text-left">
            <p className="text-xs leading-none font-black tracking-widest text-blue-600 uppercase">
              Secure Stripe step
            </p>
            <DrawerTitle className="text-2xl leading-tight tracking-normal normal-case">
              {pendingAction?.warning?.title}
            </DrawerTitle>
            <DrawerDescription className="text-base leading-7 font-semibold text-neutral-200">
              {pendingAction?.warning?.consequence}
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 px-5 py-5">
            <div className="border-l-4 border-blue-600 bg-neutral-950 px-4 py-3 text-sm leading-6 font-medium text-neutral-200">
              {pendingAction?.warning?.context}
            </div>
            <p className="text-sm leading-6 font-medium text-neutral-400">
              {pendingAction?.warning?.finePrint}
            </p>
          </div>
          {pendingAction ? (
            <DrawerFooter className="px-5 pb-5">
              <form action={pendingAction.action}>
                <input type="hidden" name="returnPath" value={returnPath} />
                <Button type="submit" className="w-full">
                  {pendingAction.label === "Method" ? "Save payment method" : "Continue"}
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

export function TenantMobileBottomNav({ connectAction }: TenantMobileBottomNavProps) {
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
    { kind: "account", label: "Me", icon: User },
  ] satisfies readonly MobileBottomNavItem[]

  return <MobileBottomNav items={tenantItems} aria-label="Tenant mobile navigation" />
}
