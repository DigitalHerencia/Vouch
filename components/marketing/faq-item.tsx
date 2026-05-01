// components/marketing/faq-item.tsx

export interface FaqItemProps {
  index: number
  question: string
  answer: string
}

export function FaqItem({ index, question, answer }: FaqItemProps) {
  return (
    <article className="grid gap-5 border-b border-neutral-800 p-6 last:border-b-0 sm:grid-cols-[76px_1fr] sm:p-7">
      <div className="flex size-11 items-center justify-center border border-neutral-600 font-mono text-base font-black text-white sm:size-12 sm:text-lg">
        {String(index).padStart(2, "0")}
      </div>

      <div>
        <h2 className="font-(family-name:--font-display) text-[30px] leading-none tracking-[0.04em] text-white uppercase sm:text-[38px]">
          {question}
        </h2>

        <p className="mt-4 max-w-215 text-base leading-[1.35] font-semibold text-neutral-400 sm:text-lg">
          {answer}
        </p>
      </div>
    </article>
  )
}
