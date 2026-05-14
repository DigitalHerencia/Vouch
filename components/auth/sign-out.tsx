"use client"

import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SignOut({ className }: { className?: string }) {
  return (
    <SignOutButton redirectUrl="/">
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-11 rounded-none border border-neutral-800 bg-black px-4 font-(family-name:--font-display) text-sm tracking-widest text-neutral-200 uppercase hover:border-primary hover:bg-primary hover:text-white",
          className
        )}
      >
        <LogOut className="mr-2 size-4" />
        Sign out
      </Button>
    </SignOutButton>
  )
}
