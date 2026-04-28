import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Operational records</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">{emptyLabel}</p>
          ) : (
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  {columns.map((column) => (
                    <th key={column.key} className="py-3 pr-4 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
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
        </CardContent>
      </Card>
    </main>
  )
}
