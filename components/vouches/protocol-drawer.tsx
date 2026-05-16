import type { ReactNode } from "react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

export interface ProtocolDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  consequence: ReactNode
  context?: ReactNode
  primary: ReactNode
  finePrint?: ReactNode
  secondaryLabel?: string
}

export function ProtocolDrawer({
  open,
  onOpenChange,
  title,
  consequence,
  context,
  primary,
  finePrint,
  secondaryLabel = "Keep reviewing",
}: ProtocolDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="grid gap-4 px-4 py-5 sm:px-6">
          <section className="border border-neutral-800 bg-neutral-950 p-3 text-sm leading-6 text-neutral-300">
            {consequence}
          </section>
          {context ? (
            <section className="border border-neutral-800 bg-black p-3 text-sm leading-6 text-neutral-400">
              {context}
            </section>
          ) : null}
          <div>{primary}</div>
          {finePrint ? (
            <p className="text-xs leading-5 font-semibold text-neutral-500">{finePrint}</p>
          ) : null}
        </div>
        <DrawerFooter>
          <DrawerClose className="h-11 border border-neutral-700 bg-transparent px-4 font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase">
            {secondaryLabel}
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
