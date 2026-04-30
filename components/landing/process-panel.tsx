import { Square, UsersRound, CheckCircle2, LockKeyhole } from "lucide-react"

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
    <aside className="mx-auto w-full max-w-130 border border-neutral-700 bg-[#060908]/80 backdrop-blur-sm lg:mt-5">
      <div className="border-b border-neutral-700 px-6 py-5">
        <p className="text-[12px] font-black tracking-[0.14em] text-neutral-200 uppercase">
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
                <div className="flex size-9 shrink-0 items-center justify-center border border-neutral-500 text-sm font-black text-white">
                  {step.number}
                </div>

                <div>
                  <h2 className="text-sm font-black tracking-[0.08em] text-neutral-100 uppercase sm:text-base">
                    {step.title}
                  </h2>
                  <p className="mt-1 max-w-52.5 text-xs leading-4 font-semibold text-neutral-400 sm:text-sm sm:leading-5">
                    {step.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center border-l border-neutral-800">
                <Icon className="size-8 text-neutral-100" strokeWidth={1.8} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-700 px-5 py-4 text-center text-[11px] font-black tracking-[0.11em] text-white uppercase">
        No confirmation = refund / void
      </div>
    </aside>
  )
}
