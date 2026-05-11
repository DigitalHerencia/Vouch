import Link from "next/link"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"

type AdminTableColumn<Row> = { key: keyof Row & string; label: string }

type AdminTablePageProps<Row extends { id: string; href?: string }> = {
  title: string
  description: string
  columns: AdminTableColumn<Row>[]
  rows: Row[]
  emptyLabel?: string
}

export function AdminTablePage<Row extends { id: string; href?: string }>({
  title,
  description,
  columns,
  rows,
  emptyLabel = "No records found.",
}: AdminTablePageProps<Row>) {
  return (
    <main className="flex w-full flex-col gap-6">
      <SectionIntro eyebrow="Operations" title={title} body={description} />
      <Surface>
        <SurfaceHeader>
          <h2 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.07em] text-white uppercase">
            Operational records
          </h2>
        </SurfaceHeader>
        <SurfaceBody className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-sm text-neutral-400">{emptyLabel}</p>
          ) : (
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="font-mono text-xs tracking-[0.08em] text-neutral-500 uppercase">
                <tr className="border-b border-neutral-800">
                  {columns.map((column) => (
                    <th key={column.key} className="py-3 pr-4 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800 last:border-0">
                    {columns.map((column, index) => {
                      const value = String(row[column.key] ?? "")
                      return (
                        <td key={column.key} className="py-3 pr-4">
                          {index === 0 && row.href ? (
                            <Link href={row.href} className="font-medium hover:underline">
                              {value}
                            </Link>
                          ) : (
                            value
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SurfaceBody>
      </Surface>
    </main>
  )
}
