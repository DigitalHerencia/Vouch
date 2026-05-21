"use client"

import {
  ComingSoonPage,
  ForbiddenPage,
  GenericErrorPage,
  MaintenancePage,
  NotFoundPage,
  OfflinePage,
  ServerErrorPage,
} from "@/components/blocks/error-pages"

export default function ErrorPages() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-7 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <NotFoundPage showSearch backHref="#" />
        <ServerErrorPage errorId="ERR-500-VOUCH" onRetry={() => undefined} supportEmail="support@example.com" />
        <MaintenancePage
          estimatedTime="45 minutes"
          features={["Payment reconciliation", "Webhook retries", "Status updates"]}
          statusPageUrl="#"
        />
        <OfflinePage onRetry={() => undefined} />
        <ForbiddenPage loginHref="#" />
        <ComingSoonPage launchDate={new Date("2026-12-01T00:00:00")} onNotify={() => undefined} />
        <GenericErrorPage
          title="Payment State Unavailable"
          description="We could not retrieve provider-backed payment state."
          actions={[{ label: "Retry", variant: "default" }, { label: "Home", href: "#", variant: "outline" }]}
        />
      </section>
    </main>
  )
}
