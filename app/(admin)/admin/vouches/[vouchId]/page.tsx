import { AdminVouchDetailPage } from "@/features/admin"

type PageProps = { params: Promise<{ vouchId: string }> }

export default async function AdminVouchDetailRoute({ params }: PageProps) {
  const { vouchId } = await params
  return (
    <AdminVouchDetailPage
      vouchId={vouchId}
      status="unknown"
      payerId="unknown"
      paymentStatus="unknown"
      confirmationStatus="unknown"
      auditEvents={[]}
    />
  )
}
