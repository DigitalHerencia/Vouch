import { AdminTablePage } from "@/features/admin/admin-table-page"
import { getAdminWebhookEventDetail } from "@/lib/fetchers/adminFetchers"

type PageProps = { params: Promise<{ eventId: string }> }

export default async function Page({ params }: PageProps) {
  const { eventId } = await params
  const event = (await getAdminWebhookEventDetail({ eventId })) as Record<string, unknown> | null
  return <AdminTablePage title="Admin Webhook Detail" description="Provider webhook processing state." columns={[
    { key: "id", label: "ID" },
    { key: "eventType", label: "Event" },
    { key: "processed", label: "Processed" },
    { key: "processingError", label: "Error" },
  ]} rows={event ? [{ id: String(event.id), eventType: String(event.eventType), processed: String(event.processed), processingError: String(event.processingError ?? "") }] : []} />
}
