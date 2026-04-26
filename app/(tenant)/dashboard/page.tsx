import { DashboardPage } from "@/features/dashboard"

const demoSections = [
  { title: "Action required", description: "Vouches that need your attention.", vouches: [] },
  { title: "Active", description: "Accepted Vouches awaiting confirmation or resolution.", vouches: [] },
  { title: "Pending", description: "Created Vouches awaiting acceptance.", vouches: [] },
  { title: "Completed", description: "Final Vouches where both parties confirmed.", vouches: [] },
]

export default function DashboardRoute() {
  return <DashboardPage setupComplete={false} sections={demoSections} />
}
