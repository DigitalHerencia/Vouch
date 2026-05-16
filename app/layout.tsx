// app/layout.tsx

import type { Metadata, Viewport } from "next"
import { Archivo, Archivo_Black, Bebas_Neue, JetBrains_Mono } from "next/font/google"
import type { ReactNode } from "react"

import { AppProvider } from "@/components/app/app-providers"

import "./globals.css"

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const archivoBlack = Archivo_Black({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
})

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
})

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Vouch",
  title: {
    default: "Vouch — A Protocol for Commitment",
    template: "%s — Vouch",
  },
  description:
    "Deterministic payment coordination for appointments and in-person agreements. Both parties confirm presence inside the confirmation window before funds release.",
  keywords: [
    "Vouch",
    "payment coordination",
    "commitment-backed payments",
    "presence confirmation",
    "bilateral confirmation",
    "provider-backed settlement",
    "manual capture payments",
  ],
  authors: [{ name: "Vouch" }],
  creator: "Vouch",
  publisher: "Vouch",
  category: "financial technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Vouch",
    title: "Vouch — A Protocol for Commitment",
    description:
      "Outcome follows system state. Both parties confirm presence inside the confirmation window before funds release.",
    images: [
      {
        url: "/VOUCHdark.png",
        width: 1200,
        height: 630,
        alt: "Vouch — A Protocol for Commitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — A Protocol for Commitment",
    description: "Deterministic payment coordination for real-world commitments.",
    images: ["/VOUCHdark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon-192.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${bebasNeue.variable} ${jetBrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh overflow-x-hidden bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <AppProvider>
          <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,--alpha(var(--color-primary)/22%),transparent_34rem),linear-gradient(to_bottom,--alpha(var(--color-foreground)/4.5%)_1px,transparent_1px),linear-gradient(to_right,--alpha(var(--color-foreground)/3.5%)_1px,transparent_1px)] bg-size-[auto,48px_48px,48px_48px]">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
