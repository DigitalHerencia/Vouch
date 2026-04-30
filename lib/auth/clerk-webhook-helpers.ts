import type { ClerkWebhookEvent, ClerkWebhookUserData } from "@/types/auth"
import { clerkWebhookEventSchema } from "@/schemas/auth"

export function extractClerkUserEmail(data: ClerkWebhookUserData): string | undefined {
  const primary = data.email_addresses?.find((email) => email.id === data.primary_email_address_id)
  return primary?.email_address ?? data.email_addresses?.[0]?.email_address
}

export function extractClerkUserPhone(data: ClerkWebhookUserData): string | undefined {
  const primary = data.phone_numbers?.find((phone) => phone.id === data.primary_phone_number_id)
  return primary?.phone_number ?? data.phone_numbers?.[0]?.phone_number
}

export function extractClerkDisplayName(data: ClerkWebhookUserData): string | undefined {
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim()
  return name || data.username || extractClerkUserEmail(data)
}

export function parseClerkWebhookJson(rawBody: string): ClerkWebhookEvent {
  return clerkWebhookEventSchema.parse(JSON.parse(rawBody)) as ClerkWebhookEvent
}
