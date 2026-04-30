import { AdminTablePage } from "@/features/admin/admin-table-page"
import { getAdminPaymentDetail } from "@/lib/fetchers/adminFetchers"

type PageProps = { params: Promise<{ paymentId: string }> }

export default async function Page({ params }: PageProps) {
  const { paymentId } = await params
  const payment = (await getAdminPaymentDetail({ paymentId })) as Record<string, unknown> | null
  return (
    <AdminTablePage
      title="Admin Payment Detail"
      description="Provider-backed payment state."
      columns={[
        { key: "id", label: "ID" },
        { key: "provider", label: "Provider" },
        { key: "status", label: "Status" },
        { key: "lastErrorCode", label: "Error" },
      ]}
      rows={
        payment
          ? [
              {
                id: String(payment.id),
                provider: String(payment.provider),
                status: String(payment.status),
                lastErrorCode: String(payment.lastErrorCode ?? ""),
              },
            ]
          : []
      }
    />
  )
}
