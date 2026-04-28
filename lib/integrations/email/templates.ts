import "server-only"

import type { NotificationType } from "@/types/notification"

export type LifecycleEmail = {
  subject: string
  text: string
}

type EmailContext = {
  vouchId?: string | null
  appUrl?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

function render(type: NotificationType, context: EmailContext = {}): LifecycleEmail {
  const vouchUrl = context.vouchId ? `${context.appUrl ?? APP_URL}/vouches/${context.vouchId}` : APP_URL

  switch (type) {
    case "invite":
      return {
        subject: "You have a Vouch invite",
        text: `A Vouch invite is ready. Review it here: ${vouchUrl}`,
      }
    case "vouch_accepted":
      return { subject: "Your Vouch was accepted", text: `Your Vouch was accepted: ${vouchUrl}` }
    case "confirmation_window_open":
      return { subject: "Confirm presence for your Vouch", text: `The confirmation window is open: ${vouchUrl}` }
    case "confirmation_recorded":
      return { subject: "Vouch confirmation recorded", text: `A confirmation was recorded: ${vouchUrl}` }
    case "vouch_completed":
      return { subject: "Vouch completed", text: `Both parties confirmed and funds were released: ${vouchUrl}` }
    case "vouch_expired_refunded":
      return { subject: "Vouch expired", text: `Both confirmations were not completed, so funds did not release: ${vouchUrl}` }
    case "payment_failed":
      return { subject: "Vouch payment needs attention", text: `A payment provider issue needs review: ${vouchUrl}` }
  }
}

export async function renderInviteEmail(context?: EmailContext) {
  return render("invite", context)
}

export async function renderVouchAcceptedEmail(context?: EmailContext) {
  return render("vouch_accepted", context)
}

export async function renderConfirmationWindowOpenEmail(context?: EmailContext) {
  return render("confirmation_window_open", context)
}

export async function renderConfirmationRecordedEmail(context?: EmailContext) {
  return render("confirmation_recorded", context)
}

export async function renderVouchCompletedEmail(context?: EmailContext) {
  return render("vouch_completed", context)
}

export async function renderVouchExpiredRefundedEmail(context?: EmailContext) {
  return render("vouch_expired_refunded", context)
}

export async function renderPaymentFailedEmail(context?: EmailContext) {
  return render("payment_failed", context)
}

export async function renderLifecycleEmail(type: NotificationType, context?: EmailContext) {
  return render(type, context)
}
