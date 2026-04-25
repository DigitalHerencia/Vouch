import "server-only"

export type ClerkWebhookEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | string

export type ClerkWebhookUserData = {
  id: string
  email_addresses?: Array<{ email_address?: string; id?: string }>
  primary_email_address_id?: string | null
  phone_numbers?: Array<{ phone_number?: string; id?: string }>
  primary_phone_number_id?: string | null
  first_name?: string | null
  last_name?: string | null
  username?: string | null
}

export type ClerkWebhookEvent = {
  id?: string
  type: ClerkWebhookEventType
  data: ClerkWebhookUserData
}

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
  const parsed = JSON.parse(rawBody) as ClerkWebhookEvent

  if (!parsed.type || !parsed.data?.id) {
    throw new Error("Invalid Clerk webhook payload.")
  }

  return parsed
}
