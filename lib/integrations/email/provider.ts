import "server-only"

import { renderLifecycleEmail } from "@/lib/integrations/email/templates"
import type { NotificationType } from "@/types/notification"

export type SendEmailInput = {
  to: string
  subject: string
  text: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ providerMessageId: string }> {
  if (!input.to.trim()) throw new Error("EMAIL_RECIPIENT_REQUIRED")
  if (!input.subject.trim()) throw new Error("EMAIL_SUBJECT_REQUIRED")

  return {
    providerMessageId: `local-email:${crypto.randomUUID()}`,
  }
}

export async function sendLifecycleEmail(input: {
  to: string
  type: NotificationType
  vouchId?: string | null
}): Promise<{ providerMessageId: string }> {
  const email = await renderLifecycleEmail(
    input.type,
    input.vouchId === undefined ? {} : { vouchId: input.vouchId }
  )
  return sendEmail({ to: input.to, subject: email.subject, text: email.text })
}
