import Link from "next/link"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { checkoutSuccessContent } from "@/content/common"

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
    <section className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <p className="font-(family-name:--font-display) text-sm leading-none tracking-[0.08em] text-blue-600 uppercase">
            {checkoutSuccessContent.eyebrow}
          </p>
          <CardTitle className="text-[clamp(2.75rem,6vw,5rem)]">
            {checkoutSuccessContent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-base leading-7 font-bold text-neutral-400">
            {message ?? checkoutSuccessContent.description}
          </p>
          <Alert>
            <AlertDescription>{checkoutSuccessContent.notice}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          {signUpHref ? (
            <Button className="w-full justify-center sm:w-auto" variant="primary" asChild>
              <Link href={signUpHref}>{checkoutSuccessContent.createAccount}</Link>
            </Button>
          ) : null}
          <Button className="w-full justify-center sm:w-auto" asChild>
            <Link href={signInHref ?? "/dashboard"}>
              {signInHref ? checkoutSuccessContent.signIn : checkoutSuccessContent.dashboard}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
