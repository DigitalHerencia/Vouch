import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Key,
  Upload,
  Save,
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"

// ============================================================================
// SETTINGS VARIANT 1: Profile Settings
// ============================================================================
const defaultProfileUser = {
  name: "",
  email: "",
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

export function ProfileSettings({ user = defaultProfileUser }: ProfileSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <User className="h-12 w-12" />
          Profile Settings
        </CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-3 border-neutral-400 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-bold">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold">Profile Photo</h3>
              <p className="text-sm text-neutral-400">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase">
                Full Name
              </Label>
              <Input
                id="name"
                value={user.name}
                readOnly
                placeholder="John Doe"
                className="border-2 border-neutral-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                placeholder="you@example.com"
                className="border-2 border-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs font-bold uppercase">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={user.bio ?? ""}
              readOnly
              placeholder="Tell us about yourself..."
              rows={3}
              className="border-2 border-neutral-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs font-bold uppercase">
                Company
              </Label>
              <Input
                id="company"
                value={user.company ?? ""}
                readOnly
                placeholder="Acme Inc."
                className="border-2 border-neutral-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-bold uppercase">
                Location
              </Label>
              <Input
                id="location"
                value={user.location ?? ""}
                readOnly
                placeholder="San Francisco, CA"
                className="border-2 border-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-xs font-bold uppercase">
              Website
            </Label>
            <Input
              id="website"
              value={user.website ?? ""}
              readOnly
              placeholder="https://yourwebsite.com"
              className="border-2 border-neutral-400"
            />
          </div>

          <div className="flex justify-end">
            <Button type="button">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SETTINGS VARIANT 2: Notification Settings
// ============================================================================
export interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
}

export interface NotificationSettingsProps {
  notifications?: NotificationSetting[]
  onSave?: (settings: NotificationSetting[]) => void
}

const defaultNotifications: NotificationSetting[] = [
  {
    id: "comments",
    title: "Comments",
    description: "Get notified when someone comments on your post",
    email: true,
    push: true,
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "Get notified when someone mentions you",
    email: true,
    push: false,
  },
  {
    id: "updates",
    title: "Product Updates",
    description: "News about new features and improvements",
    email: true,
    push: false,
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Promotional emails and offers",
    email: false,
    push: false,
  },
]

export function NotificationSettings({
  notifications = defaultNotifications,
}: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Bell className="h-12 w-12" />
          Notifications
        </CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mr-8 flex items-center justify-end gap-8 text-xs font-bold tracking-wide text-white uppercase">
          <span>Email</span>
          <span>Push</span>
        </div>

        <div className="space-y-4">
          {notifications.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between border-3 border-neutral-400 bg-black p-4"
            >
              <div>
                <p className="font-bold">{setting.title}</p>
                <p className="text-sm text-neutral-400">{setting.description}</p>
              </div>
              <div className="flex items-center gap-6">
                <Switch
                  defaultChecked={setting.email}
                  aria-label={`${setting.title} email notifications`}
                />
                <Switch
                  defaultChecked={setting.push}
                  aria-label={`${setting.title} push notifications`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="button">
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SETTINGS VARIANT 3: Security Settings
// ============================================================================
export interface SecuritySettingsProps {
  twoFactorEnabled?: boolean
  sessions?: Array<{
    id: string
    device: string
    location: string
    lastActive: string
    current?: boolean
  }>
  onChangePassword?: () => void
  onToggleTwoFactor?: (enabled: boolean) => void
  onRevokeSession?: (sessionId: string) => void
}

export function SecuritySettings({
  twoFactorEnabled = false,
  sessions = [],
}: SecuritySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Shield className="h-12 w-12" />
          Security
        </CardTitle>
        <CardDescription>Manage your account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password */}
        <div className="flex items-center justify-between border-3 border-neutral-400 bg-black p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-neutral-400 bg-blue-600">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">Password</p>
              <p className="text-sm text-neutral-400">Last changed 30 days ago</p>
            </div>
          </div>
          <Button type="button" variant="outline">
            Change Password
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between border-3 border-neutral-400 bg-black p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-neutral-400 bg-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">Two-Factor Authentication</p>
              <p className="text-sm text-neutral-400">
                {twoFactorEnabled
                  ? "Enabled - Your account is more secure"
                  : "Add an extra layer of security"}
              </p>
            </div>
          </div>
          <Switch defaultChecked={twoFactorEnabled} aria-label="Two-factor authentication" />
        </div>

        {/* Active Sessions */}
        {sessions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase">Active Sessions</h4>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between border-2 border-neutral-400 p-3"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        {session.device}
                        {session.current && (
                          <span className="bg-blue-600 px-2 py-0.5 text-xs font-bold text-white uppercase">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                    {!session.current && (
                      <Button type="button" variant="outline" size="sm">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SETTINGS VARIANT 4: Appearance Settings
// ============================================================================
export interface AppearanceSettingsProps {
  theme?: "light" | "dark" | "system"
  accentColor?: string
  onThemeChange?: (theme: "light" | "dark" | "system") => void
  onAccentColorChange?: (color: string) => void
}

export function AppearanceSettings({ theme = "system" }: AppearanceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Palette className="h-12 w-12" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={
                  theme === value
                    ? "flex flex-col items-center gap-2 border-3 border-neutral-400 bg-blue-600 p-4 text-white shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] transition-all"
                    : "flex flex-col items-center gap-2 border-3 border-neutral-400 bg-black p-4 transition-all hover:bg-black"
                }
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-bold uppercase">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SETTINGS VARIANT 5: Danger Zone
// ============================================================================
export interface DangerZoneProps {
  onExportData?: () => void
  onDeactivate?: () => void
  onDelete?: () => void
}

export function DangerZone({}: DangerZoneProps) {
  return (
    <Card className="border-red-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black text-red-600 uppercase">
          <AlertTriangle className="h-12 w-12" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-2 border-neutral-400 p-4">
          <div>
            <p className="font-bold">Export Data</p>
            <p className="text-sm text-neutral-400">Download all your data in JSON format</p>
          </div>
          <Button type="button" variant="outline">
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between border-2 border-neutral-400 p-4">
          <div>
            <p className="font-bold">Deactivate Account</p>
            <p className="text-sm text-neutral-400">Temporarily disable your account</p>
          </div>
          <Button type="button" variant="outline">
            Deactivate
          </Button>
        </div>

        <div className="flex items-center justify-between border-2 border-red-600 bg-red-600/10 p-4">
          <div>
            <p className="font-bold text-red-600">Delete Account</p>
            <p className="text-sm text-neutral-400">Permanently delete your account and all data</p>
          </div>
          <Button type="button" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// SETTINGS VARIANT 6: Full Settings Page
// ============================================================================
export interface SettingsPageProps {
  defaultTab?: string
}

export function SettingsPage({ defaultTab = "profile" }: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h3 className="text-3xl font-black uppercase">Settings</h3>
        <p className="mt-1 text-neutral-400">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings
            sessions={[
              {
                id: "1",
                device: "Chrome on MacOS",
                location: "San Francisco, CA",
                lastActive: "Now",
                current: true,
              },
              {
                id: "2",
                device: "Safari on iPhone",
                location: "New York, NY",
                lastActive: "2 hours ago",
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black uppercase">
                <CreditCard className="h-12 w-12" />
                Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400">Billing settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <DangerZone />
      </div>
    </div>
  )
}

// ============================================================================
// Export all variants
// ============================================================================
export const SettingsBlocks = {
  Profile: ProfileSettings,
  Notifications: NotificationSettings,
  Security: SecuritySettings,
  Appearance: AppearanceSettings,
  DangerZone: DangerZone,
  Page: SettingsPage,
}
