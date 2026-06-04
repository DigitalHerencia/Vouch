import Link from "next/link"

import { Button } from "@/components/ui/button"

type AuthorizationCheckoutCardProps = {
  checkoutUrl: string
}

export function AuthorizationCheckoutCard({ checkoutUrl }: AuthorizationCheckoutCardProps) {
  return (
    <div className="border border-neutral-400 bg-neutral-900 p-4">
      <p className="text-sm font-black text-white uppercase">Customer authorization link</p>
      <p className="mt-2 text-xs leading-5 font-semibold text-neutral-400">
        Send this Stripe-hosted link to the customer to authorize the Vouch amount.
      </p>
      <Button asChild className="mt-4">
        <Link href={checkoutUrl} target="_blank" rel="noreferrer">
          Open authorization checkout
        </Link>
      </Button>
    </div>
  )
}
