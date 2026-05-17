import { Suspense } from "react"
import { ConfirmCreateVouchPageSkeleton } from "@/components/vouches/confirm-create-vouch-page-skeleton"
import { ConfirmCreateVouchPage } from "@/features/vouches/confirm-create-vouch-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const value = (key: string) => {
    const raw = params[key]
    return Array.isArray(raw) ? raw[0] : raw
  }
  const amount = value("amount")
  const appointmentStartsAt = value("appointmentStartsAt")
  const confirmationOpensAt = value("confirmationOpensAt")
  const confirmationExpiresAt = value("confirmationExpiresAt")
  const draft =
    amount && appointmentStartsAt && confirmationOpensAt && confirmationExpiresAt
      ? {
          amount: String(Number(amount) / 100),
          appointmentStartsAt,
          confirmationOpensAt,
          confirmationExpiresAt,
        }
      : null

  return (
    <Suspense fallback={<ConfirmCreateVouchPageSkeleton />}>
      <ConfirmCreateVouchPage draft={draft} />
    </Suspense>
  )
}
