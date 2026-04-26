import { CreateVouchPage } from "@/features/vouches"

export default function NewVouchRoute() {
  return <CreateVouchPage blockedReason="Complete setup before creating a payment-backed Vouch." />
}
