import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Archivo, JetBrains_Mono } from "next/font/google"

import "./globals.css"

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
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
    default: "Vouch — Commitment-backed payments",
    template: "%s — Vouch",
  },
  description:
    "Commitment-backed payments for appointments and in-person agreements. Both parties confirm presence, then funds release. Otherwise, refund or non-capture.",
  keywords: [
    "Vouch",
    "commitment-backed payments",
    "no-show protection",
    "appointment payments",
    "payment coordination",
    "presence confirmation",
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
    title: "Vouch — Commitment-backed payments",
    description:
      "A simple payment coordination layer for appointments and in-person agreements. Both parties confirm presence, then funds release.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — Commitment-backed payments",
    description:
      "Both parties confirm presence, then funds release. Otherwise, refund or non-capture.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetBrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        <ClerkProvider dynamic>{children}</ClerkProvider>
      </body>
    </html>
  )
}
