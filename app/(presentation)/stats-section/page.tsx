import {
  StatsCards,
  StatsGrid,
  StatsInline,
  StatsSplit,
  StatsWithIcons,
} from "@/components/blocks/stats-section"
import { BadgeCheck, Clock, CreditCard, Shield } from "lucide-react"

const stats = [
  {
    value: "2",
    label: "Confirmations",
    description: "Required for release",
    trend: "neutral" as const,
    trendValue: "fixed",
  },
  {
    value: "0",
    label: "Manual Awards",
    description: "No force-release control",
    trend: "down" as const,
    trendValue: "blocked",
  },
  {
    value: "1",
    label: "Window",
    description: "Time-bound outcome",
    trend: "neutral" as const,
    trendValue: "set",
  },
  {
    value: "100%",
    label: "State Based",
    description: "Provider-backed resolution",
    trend: "up" as const,
    trendValue: "deterministic",
  },
]

const statsWithIcons = [
  {
    value: "2",
    label: "Confirmations",
    description: "Required for release",
    icon: <BadgeCheck className="h-7 w-7" />,
  },
  {
    value: "0",
    label: "Manual Awards",
    description: "No force-release control",
    icon: <Shield className="h-7 w-7" />,
  },
  {
    value: "1",
    label: "Window",
    description: "Time-bound outcome",
    icon: <Clock className="h-7 w-7" />,
  },
  {
    value: "100%",
    label: "State Based",
    description: "Provider-backed resolution",
    icon: <CreditCard className="h-7 w-7" />,
  },
]

export default function StatsSection() {
  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <StatsGrid stats={stats} />
        <StatsCards title="Coordination Metrics" subtitle="Vouch" stats={stats} />
        <StatsSplit
          title="Payment Outcomes Follow State"
          description="Both confirmations inside the window release funds; every other state resolves without capture."
          stats={stats}
        />
        <StatsInline stats={stats} />
        <StatsWithIcons stats={statsWithIcons} />
      </section>
    </main>
  )
}
