export function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-800 pb-3 last:border-0 last:pb-0">
      <span className="min-w-0 text-sm leading-5 font-semibold text-neutral-400">{label}</span>
      <span className="text-right font-mono text-sm leading-5 font-black text-white uppercase">
        {value}
      </span>
    </div>
  )
}
