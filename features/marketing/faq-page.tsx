import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const questions = [
  ["What is Vouch?", "Vouch is a commitment-backed payment tool for appointments and in-person agreements. Funds release only when both parties confirm presence during the defined window."],
  ["Is Vouch a marketplace?", "No. Vouch does not help users find each other, list services, message, review, rank, or book providers."],
  ["Does Vouch hold my money?", "Vouch uses payment-provider infrastructure to coordinate payment outcomes. Vouch does not directly custody funds."],
  ["What happens if only one person confirms?", "Funds do not release. Both parties must confirm within the confirmation window."],
  ["Does Vouch decide disputes?", "No. Vouch outcomes are deterministic. The system does not judge who was right or wrong."],
] as const

export function FaqPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">FAQ</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Clear rules. No hidden judgment.</h1>
      </div>
      <div className="grid gap-4">
        {questions.map(([question, answer]) => (
          <Card key={question}>
            <CardHeader><CardTitle>{question}</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">{answer}</p></CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
