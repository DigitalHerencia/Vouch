import "server-only"

import { randomUUID } from "node:crypto"
import { headers as nextHeaders } from "next/headers"

import { hashSensitiveValue } from "@/lib/security/hash"

type HeaderBag = {
  get(name: string): string | null
}

export type RequestMetadataInput = {
  headers?: HeaderBag
}

async function getHeaderBag(input?: RequestMetadataInput): Promise<HeaderBag> {
  if (input?.headers) return input.headers

  return nextHeaders()
}

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null

  const [firstValue] = value.split(",")
  const normalized = firstValue?.trim()

  return normalized && normalized.length > 0 ? normalized : null
}

export async function getRequestId(input?: RequestMetadataInput): Promise<string> {
  const headerBag = await getHeaderBag(input)

  return (
    firstHeaderValue(headerBag.get("x-request-id")) ??
    firstHeaderValue(headerBag.get("x-vercel-id")) ??
    firstHeaderValue(headerBag.get("cf-ray")) ??
    randomUUID()
  )
}

export async function getClientIpHash(input?: RequestMetadataInput): Promise<string | null> {
  const headerBag = await getHeaderBag(input)

  const clientIp =
    firstHeaderValue(headerBag.get("x-forwarded-for")) ??
    firstHeaderValue(headerBag.get("x-real-ip")) ??
    firstHeaderValue(headerBag.get("cf-connecting-ip"))

  if (!clientIp) return null

  return hashSensitiveValue(clientIp)
}

export async function getUserAgentHash(input?: RequestMetadataInput): Promise<string | null> {
  const headerBag = await getHeaderBag(input)
  const userAgent = headerBag.get("user-agent")?.trim()

  if (!userAgent) return null

  return hashSensitiveValue(userAgent)
}
