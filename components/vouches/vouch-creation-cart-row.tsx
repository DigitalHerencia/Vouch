export function VouchCreationCartRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-700 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-black tracking-widest text-neutral-400 uppercase">{label}</span>
      <span
        className={
          strong
            ? "font-mono text-sm font-black text-blue-600"
            : "font-mono text-sm font-black text-white"
        }
      >
        {value}
      </span>
    </div>
  )
}
