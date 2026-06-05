import { CheckoutSuccessPage } from "@/features/payments/checkout-success-page"

export default async function CheckoutSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams
  return <CheckoutSuccessPage {...(sessionId ? { sessionId } : {})} />
}
