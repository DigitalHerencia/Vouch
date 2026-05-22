export function MetricGrid({
  items,
}: {
  items: readonly { label: string; value: string; body: string }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-3 border-neutral-400 bg-black p-5">
          <p className="text-xs font-black tracking-widest text-blue-600 uppercase">{item.label}</p>
          <p className="mt-3 font-mono text-3xl font-black text-white">{item.value}</p>
          <p className="mt-2 text-sm leading-6 font-semibold text-neutral-400">{item.body}</p>
        </div>
      ))}
    </div>
  )
}
