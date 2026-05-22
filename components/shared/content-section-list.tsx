export type ContentSectionListItem = {
  heading: string
  body: readonly string[]
}

export function ContentSectionList({ items }: { items: readonly ContentSectionListItem[] }) {
  return (
    <div className="grid gap-5">
      {items.map((item) => (
        <section key={item.heading} className="border-2 border-neutral-400 bg-black p-5">
          <h2 className="text-xl font-black text-white uppercase">{item.heading}</h2>
          <div className="mt-3 grid gap-2">
            {item.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-6 font-semibold text-neutral-400">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
