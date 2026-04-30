import { AdminTablePage } from "@/features/admin/admin-table-page"
import { getAdminUserDetail } from "@/lib/fetchers/adminFetchers"

type PageProps = { params: Promise<{ userId: string }> }

export default async function Page({ params }: PageProps) {
  const { userId } = await params
  const user = (await getAdminUserDetail({ userId })) as Record<string, unknown> | null
  return (
    <AdminTablePage
      title="Admin User Detail"
      description="Operational user readiness snapshot."
      columns={[
        { key: "id", label: "ID" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Created" },
      ]}
      rows={
        user
          ? [
              {
                id: String(user.id),
                email: String(user.email ?? ""),
                status: String(user.status),
                createdAt: String(user.createdAt),
              },
            ]
          : []
      }
    />
  )
}
