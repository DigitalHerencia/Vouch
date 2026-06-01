import type { UserID } from "./commonTypes"

export type UserStatus = "active" | "disabled" | "suspended"

export interface UserSafeIdentity {
  userId: UserID
  displayName?: string
  email?: string
}

export interface PrivateAccountInfo {
  userId: UserID
  email?: string
  phone?: string
  displayName?: string
  status: UserStatus
}

export interface ProfileBasicsInput {
  displayName?: string
  phone?: string
}

export interface UserStatusChangeInput {
  userId: UserID
  reason?: string
}

export type AccountPageVariant = "overview" | "private_info" | "disabled" | "loading" | "error"

export type UserMenuProps = Readonly<{
  size?: "default" | "compact"
}>

type AccountItem = BaseItem & {
  kind: "account"
}

export interface ProfileSettingsProps {
  user?: {
    name: string
    email: string
    avatar?: string
    bio?: string
    company?: string
    location?: string
    website?: string
  }
  onSave?: (data: ProfileSettingsProps["user"]) => void
  onAvatarChange?: (file: File) => void
}

export interface ProfileSetupProps {
  name: string
  role: string
  interests: string[]
  avatarPreview?: string | null
  avatarError?: string | null
  onNameChange: (name: string) => void
  onRoleChange: (role: string) => void
  onInterestToggle: (interest: string) => void
  onAvatarInputClick?: () => void
  onAvatarChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: () => void
  availableRoles?: Array<{ value: string; label: string }>
  availableInterests?: Array<{ value: string; label: string }>
}

export type CurrentUser = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: "active" | "disabled"
  isAdmin: boolean
}

type SafeUserRecord = {
  id: string
  displayName: string | null
  email: string | null
  status: string
}

export type SafeUserDTO = {
  id: string
  displayName: string | null
  email: string | null
  status: string
}

type LocalUserSyncInput = {
  clerkUserId: string
  email?: string | null
  phone?: string | null
  displayName?: string | null
}

export type LocalUserSyncInput = {
  clerkUserId: string
  email?: string
  phone?: string
  displayName?: string
}

export type UserSyncInput = z.infer<typeof userSyncSchema>
