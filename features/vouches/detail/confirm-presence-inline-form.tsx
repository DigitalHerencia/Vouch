import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { confirmPresence } from "@/lib/actions/vouchActions"

export function ConfirmPresenceInlineForm({ vouchId }: { vouchId: string }) {
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
      <label className="text-sm font-semibold text-neutral-300" htmlFor="submittedCode">
        Confirmation code
      </label>
      <Input
        id="submittedCode"
        className="h-12 rounded-none border-neutral-800 bg-neutral-950 font-mono text-white"
        maxLength={12}
        minLength={4}
        name="submittedCode"
        required
      />
      <Button className="h-12 w-full rounded-none bg-blue-700" type="submit">
        Confirm my presence
        <ArrowRight className="ml-auto size-5" />
      </Button>
    </form>
  )
}
