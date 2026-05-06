"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { loadStripe, type StripeElements } from "@stripe/stripe-js"
import { CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"

type SetupActionResult =
  | {
      ok: true
      data: {
        clientSecret?: string | null
      }
    }
  | {
      ok: false
      formError?: string
      code?: string
    }

type PaymentMethodSetupFormProps = {
  publishableKey?: string | undefined
  ready: boolean
  startAction: () => Promise<SetupActionResult>
}

export function PaymentMethodSetupForm({
  publishableKey,
  ready,
  startAction,
}: PaymentMethodSetupFormProps) {
  const paymentElementRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef<StripeElements | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let mounted = true

    async function mountPaymentElement() {
      if (!publishableKey || !clientSecret || !paymentElementRef.current) return

      const stripe = await loadStripe(publishableKey)
      if (!stripe || !mounted || !paymentElementRef.current) return

      paymentElementRef.current.replaceChildren()
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            borderRadius: "0px",
            colorPrimary: "#1D4ED8",
            colorBackground: "#050505",
            colorText: "#FFFFFF",
          },
        },
      })
      elements.create("payment").mount(paymentElementRef.current)
      elementsRef.current = elements
    }

    void mountPaymentElement()

    return () => {
      mounted = false
    }
  }, [clientSecret, publishableKey])

  function beginSetup() {
    setError(null)
    startTransition(async () => {
      const result = await startAction()
      if (!result.ok) {
        setError(result.formError ?? result.code ?? "Payment setup could not start.")
        return
      }
      if (!result.data.clientSecret) {
        setError("Stripe did not return a setup client secret.")
        return
      }
      setClientSecret(result.data.clientSecret)
    })
  }

  async function confirmSetup() {
    setError(null)

    if (!publishableKey || !elementsRef.current) {
      setError("Payment setup is not ready yet.")
      return
    }

    const stripe = await loadStripe(publishableKey)
    if (!stripe) {
      setError("Stripe could not load.")
      return
    }

    const result = await stripe.confirmSetup({
      elements: elementsRef.current,
      confirmParams: {
        return_url: `${window.location.origin}/settings/payment/return`,
      },
    })

    if (result.error) {
      setError(result.error.message ?? "Stripe could not confirm this payment method.")
    }
  }

  if (!publishableKey) {
    return (
      <p className="border border-neutral-800 bg-black/40 p-3 text-sm text-neutral-400">
        Stripe publishable key is not configured.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      {!clientSecret ? (
        <Button
          type="button"
          onClick={beginSetup}
          disabled={isPending}
          className="h-11 rounded-none bg-blue-700 px-5"
        >
          <CreditCard />
          {ready ? "Update method" : "Start setup"}
        </Button>
      ) : (
        <div className="grid gap-4">
          <div ref={paymentElementRef} className="border border-neutral-800 bg-black p-4" />
          <Button
            type="button"
            onClick={confirmSetup}
            className="h-11 rounded-none bg-blue-700 px-5"
          >
            <CreditCard />
            Save payment method
          </Button>
        </div>
      )}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
