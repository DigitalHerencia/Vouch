"use client"

import { SignOutButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export function SignOut() {
  return (
    <SignOutButton redirectUrl="/">
      <Button type="button" variant="ghost">
        Sign out
      </Button>
    </SignOutButton>
  )
}
