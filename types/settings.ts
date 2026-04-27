export type SettingsPageVariant =
  | "overview"
  | "profile_basics"
  | "verification_status"
  | "payment_readiness"
  | "payout_readiness"
  | "terms_legal_status"
  | "account_disabled"
  | "loading"
  | "error"

export type SettingsSectionID =
  | "profile"
  | "verification"
  | "payment"
  | "payout"
  | "terms"
  | "security"

export interface SettingsSearchParams {
  section?: SettingsSectionID
  returnTo?: string
}

export interface UpdateProfileBasicsInput {
  displayName?: string
  phone?: string
}
