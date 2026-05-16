import * as React from "react"

import { cn } from "@/lib/utils"

function NavigationMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="navigation-menu" className={cn("flex items-center gap-8", className)} {...props} />
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="navigation-menu-list" className={cn("flex items-center gap-6", className)} {...props} />
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="navigation-menu-item" className={cn("list-none", className)} {...props} />
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="navigation-menu-link"
      className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 hover:text-white data-[active=true]:text-white", className)}
      {...props}
    />
  )
}

export { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList }