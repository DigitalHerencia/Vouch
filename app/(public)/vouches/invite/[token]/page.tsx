import { AcceptVouchPage } from "@/features/vouches"

type PageProps = { params: Promise<{ token: string }> }

export default async function InviteRoute({ params }: PageProps) {
  await params
  return (
    <AcceptVouchPage
      tokenValid={true}
      signedIn={false}
      eligible={false}
      amountLabel="Unavailable"
      payerLabel="Unavailable"
      windowLabel="Unavailable"
    />
  )
}
