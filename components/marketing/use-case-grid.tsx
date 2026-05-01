// components/marketing/use-case-grid.tsx

import { CalendarDays, MoreHorizontal, UsersRound, Wrench } from "lucide-react"

const useCases = [
  {
    icon: CalendarDays,
    title: "Appointments",
    body: "Protect medical, wellness, legal, financial, and other important appointments.",
  },
  {
    icon: UsersRound,
    title: "Meetups",
    body: "Feel confident meeting someone in person for the first time.",
  },
  {
    icon: Wrench,
    title: "Services",
    body: "Secure payment for one-time services and specialized work.",
  },
  {
    icon: MoreHorizontal,
    title: "And more",
    body: "Any in-person agreement where commitment matters.",
  },
]

export function UseCaseGrid() {
  return (
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {useCases.map((item) => {
        const Icon = item.icon

        return (
          <article
            key={item.title}
            className="min-h-52.5 border border-neutral-700 bg-black/55 p-6 backdrop-blur-[2px]"
          >
            <Icon className="size-9 text-white" strokeWidth={1.7} />
            <h3 className="mt-8 font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase">
              {item.title}
            </h3>
            <p className="mt-4 text-[15px] leading-[1.28] font-semibold text-neutral-400">
              {item.body}
            </p>
          </article>
        )
      })}
    </div>
  )
}
