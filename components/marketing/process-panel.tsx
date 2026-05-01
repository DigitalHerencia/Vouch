// components/marketing/process-panel.tsx

import { CheckCircle2, FilePenLine, LockKeyhole, UsersRound } from "lucide-react"

const processSteps = [
  {
    number: "1",
    title: "Create",
    body: "You create a Vouch and set the terms.",
    icon: FilePenLine,
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
      <div className="border-b border-neutral-800 px-6 py-6">
        <p className="font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
          The Vouch Process
        </p>
      </div>

      <div>
        {processSteps.map((step) => {
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className="grid min-h-31 grid-cols-[1fr_92px] border-b border-neutral-800 sm:grid-cols-[1fr_124px] lg:min-h-34"
            >
              <div className="flex items-center gap-5 px-5 py-5 sm:gap-6 sm:px-7">
                <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-11 sm:text-lg">
                  {step.number}
                </div>

                <div>
                  <h2 className="font-(family-name:--font-display) text-2xl leading-none tracking-[0.07em] text-white uppercase sm:text-3xl lg:text-[34px]">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-65 text-base leading-tight font-semibold text-neutral-400 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-9 text-white sm:size-10" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-[#1D4ED8] px-5 py-5 text-center font-(family-name:--font-display) text-sm leading-none tracking-widest text-white uppercase sm:text-base lg:text-lg">
        No confirmation = refund / void
      </div>
    </aside>
  )
}
