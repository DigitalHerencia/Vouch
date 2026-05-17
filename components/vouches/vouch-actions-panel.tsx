import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface VouchActionsPanelProps {
  title: string
  providerBoundary: string
}

export function VouchActionsPanel({ title, providerBoundary }: VouchActionsPanelProps) {
  return (
    <Card className="bg-black/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Alert>
          <AlertDescription>{providerBoundary}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
