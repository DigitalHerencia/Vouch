export interface FaqItemProps {
  index: number
  question: string
  answer: string
}

export function FaqItem({ index, question, answer }: FaqItemProps) {
  return (
    <article className="grid gap-4 border-b border-neutral-800 p-6 last:border-b-0 sm:grid-cols-[72px_1fr]">
      <div className="flex size-10 items-center justify-center border border-neutral-600 font-mono text-[14px] font-bold text-white">
        {String(index).padStart(2, "0")}
      </div>

      <div>
        <h2 className="font-(family-name:--font-display) text-[28px] leading-none tracking-[0.04em] text-white uppercase">
          {question}
        </h2>
        <p className="mt-3 max-w-190 text-[16px] leading-[1.35] font-semibold text-neutral-400">
          {answer}
        </p>
      </div>
    </article>
  )
}
