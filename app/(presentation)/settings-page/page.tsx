"use client"

import {
  AppearanceSettings,
  DangerZone,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
  SettingsPage,
} from "@/components/blocks/settings-page"

const user = {
  name: "Ivan Roman",
  email: "ivan@example.com",
  bio: "Building deterministic payment coordination.",
  company: "Digital Herencia",
  location: "Nuevo Mexico",
  website: "https://example.com",
}

const sessions = [
  {
    id: "1",
    device: "Chrome on Windows",
    location: "Albuquerque, NM",
    lastActive: "Now",
    current: true,
  },
  { id: "2", device: "Safari on iPhone", location: "Santa Fe, NM", lastActive: "2 hours ago" },
]

export default function SettingsBlocksPage() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-full grid-rows-6 gap-2 md:gap-4">
        <ProfileSettings user={user} onSave={() => undefined} onAvatarChange={() => undefined} />
        <NotificationSettings onSave={() => undefined} />
        <SecuritySettings
          twoFactorEnabled
          sessions={sessions}
          onChangePassword={() => undefined}
          onToggleTwoFactor={() => undefined}
          onRevokeSession={() => undefined}
        />
        <AppearanceSettings
          theme="dark"
          accentColor="#3b82f6"
          onThemeChange={() => undefined}
          onAccentColorChange={() => undefined}
        />
        <DangerZone
          onExportData={() => undefined}
          onDeactivate={() => undefined}
          onDelete={() => undefined}
        />
        <SettingsPage />
      </section>
    </main>
  )
}
