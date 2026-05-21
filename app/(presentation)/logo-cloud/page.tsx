import {
  LogoCloudCards,
  LogoCloudGrid,
  LogoCloudMarquee,
  LogoCloudWithStats,
} from "@/components/blocks/logo-cloud"

const logos = ["Stripe", "Clerk", "Neon", "Vercel", "Prisma", "Next.js"].map((name) => ({
  name,
  logo: <span className="text-lg font-black uppercase">{name}</span>,
  url: "#",
}))

export default function LogoCloud() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-4 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <LogoCloudGrid title="Built With" subtitle="Stack" logos={logos} />
        <LogoCloudMarquee title="Provider Ecosystem" logos={logos} />
        <LogoCloudCards title="Infrastructure" subtitle="Services" logos={logos} />
        <LogoCloudWithStats
          title="Operational Coverage"
          logos={logos}
          stats={[
            { value: "100%", label: "State Based" },
            { value: "0", label: "Manual Awards" },
            { value: "24/7", label: "Webhook Reconcile" },
            { value: "1", label: "Core Rule" },
          ]}
        />
      </section>
    </main>
  )
}
