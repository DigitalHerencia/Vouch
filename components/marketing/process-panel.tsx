// components/marketing/process-panel.tsx

import { CheckCircle2, LockKeyhole, Square, UsersRound } from "lucide-react"

const processSteps = [
  {
    number: "1",
    title: "Create",
    body: "You create a Vouch and set the terms.",
    icon: Square,
  },
  {
    number: "2",
    title: "Accept",
    body: "The other party accepts the Vouch.",
    icon: UsersRound,
  },
  {
    number: "3",
    title: "Confirm",
    body: "Both confirm presence within the window.",
    icon: CheckCircle2,
  },
  {
    number: "4",
    title: "Release",
    body: "Funds release. Everyone is covered.",
    icon: LockKeyhole,
  },
]

export function ProcessPanel() {
  return (
    <aside className="w-full border border-neutral-700 bg-black/55 backdrop-blur-[2px]">
      <div className="border-b border-neutral-800 px-6 py-5">
        <p className="font-(family-name:--font-display) text-[13px] leading-none tracking-[0.08em] text-white uppercase">
          The Vouch Process
        </p>
      </div>

      <div>
        {processSteps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid min-h-23 grid-cols-[1fr_82px] border-b border-neutral-800 sm:grid-cols-[1fr_112px]"
            >
              <div className="flex items-center gap-5 px-5 py-4 sm:px-7">
                <div className="flex size-9 shrink-0 items-center justify-center border border-neutral-600 font-mono text-[15px] font-black text-white">
                  {step.number}
                </div>

                <div>
                  <h2 className="font-(family-name:--font-display) text-[19px] leading-none tracking-[0.06em] text-white uppercase">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-57.5 text-[13px] leading-[1.22] font-semibold text-neutral-400">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-8 text-white" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#1D4ED8] px-5 py-4 text-center font-(family-name:--font-display) text-[13px] leading-none tracking-[0.08em] text-white uppercase">
        No confirmation = refund / void
      </div>
    </aside>
  )
}
