export type MarketingPageID = "home" | "how_it_works" | "pricing" | "faq" | "terms" | "privacy"

export type MarketingCtaID =
  | "create_vouch"
  | "how_it_works"
  | "sign_in"
  | "get_started"
  | "learn_principles"

export type LegalPageID = "terms" | "privacy"

export interface PublicNavigationItem {
  label: string
  href: string
  external?: boolean
}

export interface MarketingEventInput {
  pageId: MarketingPageID
  path: string
  referrerDomain?: string
}

export interface MarketingCtaEventInput {
  ctaId: MarketingCtaID
  pageId: MarketingPageID
  destination?: string
}
