// app/layout.tsx

import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Archivo, Archivo_Black, Bebas_Neue, JetBrains_Mono } from "next/font/google"

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
      "A payment coordination layer for appointments and in-person agreements. Both parties confirm presence, then funds release.",
    images: [
      {
        url: "/VOUCHdark.png",
        width: 1200,
        height: 630,
        alt: "Vouch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — Commitment-backed payments",
    description:
      "Both parties confirm presence, then funds release. Otherwise, refund or non-capture.",
    images: ["/VOUCHdark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/handshake.png", type: "image/png" }],
    apple: [{ url: "/handshake.png", type: "image/png" }],
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
  children: React.ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${bebasNeue.variable} ${jetBrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh overflow-x-hidden bg-black font-sans text-white antialiased">
        <div className="pointer-events-none fixed inset-0 z-0 bg-black" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_16%_8%,rgba(29,78,216,0.28),transparent_30%),radial-gradient(circle_at_85%_78%,rgba(29,78,216,0.14),transparent_34%),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,auto,72px_72px,72px_72px] bg-position-[center,center,center,center]" />

        <ClerkProvider dynamic>
          <div className="relative z-10 mx-auto min-h-dvh w-full max-w-7xl border-x border-neutral-800/80 bg-black/35 text-white shadow-[0_0_80px_rgba(0,0,0,0.55)]">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
