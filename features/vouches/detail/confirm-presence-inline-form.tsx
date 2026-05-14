import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { confirmPresence } from "@/lib/actions/vouchActions"

export function ConfirmPresenceInlineForm({
  vouchId,
  currentUserCode,
}: {
  vouchId: string
  currentUserCode?: string
}) {
  async function action(formData: FormData) {
    "use server"

    await confirmPresence({
      vouchId,
      submittedCode: String(formData.get("submittedCode") ?? ""),
      method: "code_exchange",
    })
  }

  return (
    <form action={action} className="grid gap-3">
      {currentUserCode ? (
        <div className="border border-neutral-800 bg-neutral-950/70 p-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">Your code</p>
          <p className="mt-1 font-mono text-2xl text-white">{currentUserCode}</p>
        </div>
      ) : null}
      <label className="text-sm font-semibold text-neutral-300" htmlFor="submittedCode">
        Other participant code
      </label>
      <Input
        id="submittedCode"
        className="h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono text-white"
        inputMode="numeric"
        maxLength={6}
        minLength={6}
        name="submittedCode"
        required
      />
      <Button className="h-12 w-full" type="submit">
        Confirm my presence
        <ArrowRight className="ml-auto size-5" />
      </Button>
    </form>
  )
}
