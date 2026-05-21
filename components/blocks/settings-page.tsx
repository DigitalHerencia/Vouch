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
import { cn } from "@/lib/utils"
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
  Check,
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
  className?: string
}

export function ProfileSettings({ user = defaultProfileUser, className }: ProfileSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>Manage your public profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-3 border-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))]">
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
                className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold">Profile Photo</h3>
              <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
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
                className="border-2 border-primary-foreground"
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
                className="border-2 border-primary-foreground"
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
              className="border-2 border-primary-foreground"
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
                className="border-2 border-primary-foreground"
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
                className="border-2 border-primary-foreground"
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
              className="border-2 border-primary-foreground"
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
  className?: string
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
  className,
}: NotificationSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mr-8 flex items-center justify-end gap-8 text-xs font-bold tracking-wide text-foreground uppercase">
          <span>Email</span>
          <span>Push</span>
        </div>

        <div className="space-y-4">
          {notifications.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between border-3 border-foreground bg-card p-4"
            >
              <div>
                <p className="font-bold">{setting.title}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
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
  className?: string
}

export function SecuritySettings({
  twoFactorEnabled = false,
  sessions = [],
  className,
}: SecuritySettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Shield className="h-5 w-5" />
          Security
        </CardTitle>
        <CardDescription>Manage your account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password */}
        <div className="flex items-center justify-between border-3 border-foreground bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-card">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
          </div>
          <Button type="button" variant="outline">
            Change Password
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between border-3 border-foreground bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-card">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
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
                    className="flex items-center justify-between border-2 border-foreground p-3"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        {session.device}
                        {session.current && (
                          <span className="bg-success/20 text-success px-2 py-0.5 text-xs font-bold uppercase">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                    {!session.current && (
                      <Button type="button" variant="ghost" size="sm">
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
  className?: string
}

const accentColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
]

export function AppearanceSettings({
  theme = "system",
  accentColor = "#3b82f6",
  className,
}: AppearanceSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black uppercase">
          <Palette className="h-5 w-5" />
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
                className={cn(
                  "flex flex-col items-center gap-2 border-3 border-foreground p-4 transition-all",
                  theme === value
                    ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_hsl(var(--shadow-color))]"
                    : "bg-card hover:bg-muted"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-bold uppercase">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Accent Color */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase">Accent Color</Label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  "h-10 w-10 border-3 border-foreground transition-all",
                  accentColor === color.value && "ring-2 ring-foreground ring-offset-2"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {accentColor === color.value && <Check className="mx-auto h-5 w-5 text-white" />}
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
  className?: string
}

export function DangerZone({ className }: DangerZoneProps) {
  return (
    <Card className={cn("border-destructive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black text-destructive uppercase">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-2 border-foreground p-4">
          <div>
            <p className="font-bold">Export Data</p>
            <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
          </div>
          <Button type="button" variant="outline">
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between border-2 border-foreground p-4">
          <div>
            <p className="font-bold">Deactivate Account</p>
            <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
          </div>
          <Button type="button" variant="outline">
            Deactivate
          </Button>
        </div>

        <div className="flex items-center justify-between border-2 border-destructive/50 bg-destructive/5 p-4">
          <div>
            <p className="font-bold text-destructive">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
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
  className?: string
}

export function SettingsPage({ defaultTab = "profile", className }: SettingsPageProps) {
  return (
    <div className={cn("mx-auto max-w-4xl px-4 py-8", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight uppercase">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings and preferences</p>
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
                <CreditCard className="h-5 w-5" />
                Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing settings coming soon...</p>
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
