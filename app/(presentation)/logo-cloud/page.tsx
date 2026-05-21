import {
  LogoCloudCards,
  LogoCloudGrid,
  LogoCloudMarquee,
  LogoCloudWithStats,
} from "@/components/blocks/logo-cloud"

const logos = ["Stripe", "Clerk"].map((name) => ({
  name,
  logo: <span className="text-lg font-black uppercase">{name}</span>,
  url: "#",
}))

export default function LogoCloud() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <LogoCloudGrid title="Built With" subtitle="Stack" logos={logos} />
        <LogoCloudMarquee
          title="Trusted by leading companies"
          logos={logos}
          speed="normal" // 'slow' | 'normal' | 'fast'
          direction="left" // or 'right'
        />
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
