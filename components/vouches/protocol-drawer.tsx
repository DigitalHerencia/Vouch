"use client"

import * as React from "react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

export function ProtocolDrawer({
  open,
  onOpenChange,
  title,
  consequence,
  context,
  finePrint,
  primary,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  consequence: string
  context?: React.ReactNode
  finePrint?: string
  primary?: React.ReactNode
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b border-neutral-400 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="font-semibold">{consequence}</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 p-4">
          {context ? (
            <div className="border border-neutral-400 bg-neutral-900 p-3 text-sm font-semibold text-neutral-300">
              {context}
            </div>
          ) : null}
          {finePrint ? (
            <p className="text-xs leading-5 font-semibold text-neutral-400">{finePrint}</p>
          ) : null}
        </div>
        {primary ? <DrawerFooter>{primary}</DrawerFooter> : null}
      </DrawerContent>
    </Drawer>
  )
}
