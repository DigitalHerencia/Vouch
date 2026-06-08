export function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border border-neutral-600 bg-black p-4">
      <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
      <p className="mt-3 text-sm leading-5 font-bold wrap-break-word text-white">{value}</p>
    </div>
  )
}
