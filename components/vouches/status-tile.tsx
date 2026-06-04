export function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-neutral-400 bg-black p-4">
      <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">{label}</p>
      <p className="mt-2 truncate text-base font-black text-white uppercase">{value}</p>
    </div>
  )
}
