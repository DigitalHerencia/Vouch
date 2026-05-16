import { VouchDetailPage } from "@/features/vouches/vouch-detail-page"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function Page({ params }: PageProps) {
  const { vouchId } = await params
  return <VouchDetailPage vouchId={vouchId} />
}
