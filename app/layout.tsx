type RootLayoutProps = {
  children: React.ReactNode
}

// app/layout.tsx

import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Archivo_Black, Bebas_Neue, JetBrains_Mono } from "next/font/google"
import "./globals.css"

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Vouch",
  title: {
    default: "Vouch - A Protocol for Commitment",
    template: "%s - Vouch",
  },
  description:
    "Appointment deposit authorization through Stripe. A deposit can be captured only after both participants confirm during the appointment window.",
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
    title: "Vouch - A Protocol for Commitment",
    description:
      "Customers authorize appointment deposits directly to businesses through Stripe. Capture requires both participants to confirm during the appointment window.",
    images: [
      {
        url: "/VOUCHdark.png",
        width: 1200,
        height: 630,
        alt: "Vouch - A Protocol for Commitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch - A Protocol for Commitment",
    description: "Appointment deposit authorization with bilateral confirmation through Stripe.",
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
  themeColor: "oklch(14.5% 0 0)",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${bebasNeue.variable} ${jetBrainsMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  )
}
