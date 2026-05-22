// components/status/countdown.tsx

export interface CountdownProps {
  label: string
  value: string
  description?: string | undefined
}

export function Countdown({ label, value, description }: CountdownProps) {
  return (
    <section className="border border-neutral-400 bg-black p-5 backdrop-blur-[2px]">
      <p className="font-(family-name:--font-display) text-[14px] leading-none tracking-[0.08em] text-neutral-400 uppercase">
        {label}
      </p>

      <p className="mt-4 font-mono text-[34px] leading-none font-black text-white tabular-nums sm:text-[42px]">
        {value}
      </p>

      {description ? (
        <p className="mt-3 max-w-90 text-[14px] leading-[1.35] font-semibold text-neutral-400">
          {description}
        </p>
      ) : null}
    </section>
  )
}
