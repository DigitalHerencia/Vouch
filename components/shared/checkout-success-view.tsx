import Link from "next/link"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function CheckoutSuccessView({
  message,
  signInHref,
  signUpHref,
}: {
  message?: string
  signInHref?: string
  signUpHref?: string
}) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-blue-600 uppercase">
            Provider return
          </p>
          <CardTitle className="text-[clamp(2.75rem,6vw,5rem)]">
            Stripe returned you to Vouch.
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-base leading-7 font-bold text-neutral-400">
            {message ??
              "Vouch will use Stripe provider state, webhooks, and live provider retrieval to reconcile payment authorization before any confirmation or settlement outcome is shown as final."}
          </p>
          <Alert>
            <AlertDescription>
              This return page does not finalize payment truth. Use the dashboard or Vouch detail
              page to review the current provider-backed state.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          {signUpHref ? (
            <Button className="w-full justify-center sm:w-auto" variant="primary" asChild>
              <Link href={signUpHref}>Create Vouch account</Link>
            </Button>
          ) : null}
          <Button className="w-full justify-center sm:w-auto" asChild>
            <Link href={signInHref ?? "/dashboard"}>
              {signInHref ? "Sign in" : "Return to dashboard"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
