export function FAQCard({ item, index }: { item: FAQItem; index: number }) {
  return (
    <div className="border-3 border-neutral-400 bg-black px-6 py-8 shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] md:px-8">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-neutral-400 bg-blue-600 text-sm font-black text-white">
          {index + 1}
        </div>
        <div>
          <h4 className="font-bold tracking-wide">{item.question}</h4>
          <p className="mt-4 text-sm font-medium text-white md:text-base">{item.answer}</p>
        </div>
      </div>
    </div>
  )
}
