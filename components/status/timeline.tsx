// components/data-display/timeline.tsx

export interface TimelineItem {
  label: string
  timestampLabel?: string | undefined
  body?: string | undefined
  meta?: string | undefined
}

export interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="grid border border-neutral-400 bg-black backdrop-blur-[2px]">
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="grid gap-4 border-b border-neutral-400 p-5 last:border-b-0 sm:grid-cols-[76px_1fr_auto] sm:p-6"
        >
          <div className="flex size-11 items-center justify-center border border-neutral-400 font-mono text-base font-black text-white">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div>
            <h3 className="font-(family-name:--font-display) text-[26px] leading-none tracking-[0.04em] text-white uppercase">
              {item.label}
            </h3>

            {item.body ? (
              <p className="mt-3 max-w-175 text-[15px] leading-[1.35] font-semibold text-neutral-400">
                {item.body}
              </p>
            ) : null}
          </div>

          <div className="font-mono text-[12px] font-bold text-neutral-400 sm:text-right">
            {item.timestampLabel ? <p>{item.timestampLabel}</p> : null}
            {item.meta ? <p className="mt-2 text-neutral-400">{item.meta}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
