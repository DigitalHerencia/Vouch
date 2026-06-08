// components/shared/requirement-notice-split.tsx

import Image from "next/image"

import { Button } from "@/components/ui/button"

export type RequirementNoticeSplitProps = {
  eyebrow: string
  title: string
  body: string
  action?: ((formData: FormData) => void | Promise<void>) | undefined
  actionLabel?: string | undefined
  returnPath?: "/dashboard" | "/vouches/new" | undefined
}

export function RequirementNoticeSplit({
  eyebrow,
  title,
  body,
  action,
  actionLabel,
  returnPath,
}: RequirementNoticeSplitProps) {
  return (
    <section>
      <div className="overflow-hidden border-3 border-neutral-400 bg-black shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)]">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.42fr)]">
          <div className="flex flex-col justify-center p-5 md:p-6">
            <p className="text-xs font-black tracking-widest text-blue-600 uppercase">{eyebrow}</p>
            <h2 className="mt-2 text-2xl leading-tight font-black tracking-wide text-white uppercase md:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 font-semibold text-neutral-300 md:text-[15px] md:leading-7">
              {body}
            </p>

            {action ? (
              <form action={action} className="mt-5">
                {returnPath ? <input type="hidden" name="returnPath" value={returnPath} /> : null}
                <Button type="submit" size="lg" variant="outline">
                  {actionLabel ?? "Continue to Stripe"}
                </Button>
              </form>
            ) : null}
          </div>

          <div className="grid place-items-center border-t-3 border-neutral-400 bg-white p-6 md:border-t-0 md:border-l-3 md:p-8">
            <span className="inline-flex w-full items-center justify-center bg-white px-6 py-5">
              <Image
                src="/Stripe wordmark - Blurple.svg"
                alt="Stripe"
                width={180}
                height={75}
                className="h-auto w-40"
                priority={false}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
