import { CheckoutSuccessPage } from "@/features/payments/checkout-success-page"

export default async function CheckoutSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; vouch_id?: string }>
}) {
  const { session_id: sessionId, vouch_id: publicId } = await searchParams
  return (
    <CheckoutSuccessPage
      {...(sessionId ? { sessionId } : {})}
      {...(publicId ? { publicId } : {})}
    />
  )
}
