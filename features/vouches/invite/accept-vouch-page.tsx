import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Info, LockKeyhole, ShieldCheck } from "lucide-react"

import { SectionIntro } from "@/components/shared/section-intro"
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/shared/surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { vouchPageCopy } from "@/content/vouches"

type AcceptVouchPageProps = {
  tokenValid: boolean
  signedIn: boolean
  eligible: boolean
  amountLabel?: string
  payerLabel?: string
  windowLabel?: string
  setupHref?: string
  acceptAction?: ReactNode
  declineAction?: ReactNode
}

export function AcceptVouchPage({
  tokenValid,
  signedIn,
  eligible,
  amountLabel = "$200.00",
  payerLabel = "jordan@client.com",
  windowLabel = "May 24, 2025 · 4:00 PM - 6:00 PM",
  setupHref = "/dashboard",
  acceptAction,
  declineAction,
}: AcceptVouchPageProps) {
  const copy = vouchPageCopy.invite

  if (!tokenValid) {
    return (
      <main className="mx-auto max-w-2xl py-16">
        <Surface variant="muted">
          <SurfaceHeader>
            <h1 className="text-[32px] leading-none text-white">{copy.invalidTitle}</h1>
          </SurfaceHeader>
        </Surface>
      </main>
    )
  }

  return (
    <main className="grid w-full gap-8 lg:grid-cols-[0.9fr_1fr]">
      <section>
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body}
        />
        <Summary amountLabel={amountLabel} payerLabel={payerLabel} windowLabel={windowLabel} />
        <div className="mt-6 flex gap-4 border border-neutral-800 p-5">
          <LockKeyhole className="size-8 text-neutral-400" />
          <p className="text-sm text-neutral-400"><strong className="block text-white">{copy.secureTitle}</strong>{copy.secureBody}</p>
        </div>
      </section>

      <section className="border border-neutral-800 bg-neutral-950/70 p-5">
        <h2 className="text-[40px] leading-none text-white">{copy.acceptTitle}</h2>
        <div className="mt-7 grid grid-cols-3 items-center gap-3 text-center">
          {copy.steps.map((label, index) => (
            <div key={label}>
              <span className={index === 0 ? "mx-auto grid size-8 place-items-center bg-primary text-primary-foreground" : "mx-auto grid size-8 place-items-center bg-neutral-800 text-neutral-300"}>{index + 1}</span>
              <p className="mt-2 text-xs text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
        {!signedIn ? (
          <Notice title={copy.unsignedNotice.title} body={copy.unsignedNotice.body} />
        ) : !eligible ? (
          <Notice title={copy.ineligibleNotice.title} body={copy.ineligibleNotice.body} />
        ) : (
          <Notice title={copy.readyNotice.title} body={copy.readyNotice.body} />
        )}
        <div className="mt-4 divide-y divide-neutral-800 border border-neutral-800">
          {copy.readinessItems.map((item, index) => (
            <div key={item} className="flex items-center justify-between p-4">
              <span className="flex items-center gap-4"><span className="grid size-8 place-items-center bg-neutral-800 font-mono">{index + 1}</span><strong>{item}</strong></span>
              <Badge variant="outline" className="rounded-none border-green-700 text-green-400">{index < 3 ? copy.verified : copy.reviewTerms}</Badge>
            </div>
          ))}
        </div>
        <Surface className="mt-5 border-primary bg-neutral-950" padding="md">
          <div className="flex gap-4">
            <Info className="size-5 text-primary" />
            <p className="text-sm text-neutral-400"><strong className="block text-white">{copy.nextTitle}</strong>{copy.nextBody}</p>
          </div>
        </Surface>
        <div className="mt-5">
          {!signedIn ? (
            <div className="grid gap-3 sm:grid-cols-2"><Button render={<Link href="/sign-up" />}>{copy.signUp}</Button><Button variant="outline" render={<Link href="/sign-in" />}>{copy.signIn}</Button></div>
          ) : !eligible ? (
            <Button className="h-12 w-full" render={<Link href={setupHref} />}>{copy.reviewSetup} <ArrowRight className="ml-auto size-5" /></Button>
          ) : (
            <div>{acceptAction ?? <Button className="h-12 w-full">{copy.accept} <ArrowRight className="ml-auto size-5" /></Button>}{declineAction}</div>
          )}
        </div>
      </section>
    </main>
  )
}

function Summary({ amountLabel, payerLabel, windowLabel }: { amountLabel: string; payerLabel: string; windowLabel: string }) {
  return (
    <Surface className="mt-7" variant="muted">
      <SurfaceHeader>
        <h2 className="text-[26px] leading-none text-white">{vouchPageCopy.invite.summaryTitle}</h2>
      </SurfaceHeader>
      <SurfaceBody className="space-y-4">
        <p className="font-mono text-4xl text-white">{amountLabel} <span className="text-sm text-neutral-400">{vouchPageCopy.invite.amountCurrency}</span></p>
        <Line label="From" value={payerLabel} />
        <Line label="For" value={vouchPageCopy.invite.summaryRows.for} />
        <Line label="Label" value={vouchPageCopy.invite.summaryRows.label} />
        <Line label="Window" value={windowLabel} />
        <p className="border border-neutral-800 p-4 text-sm text-neutral-400"><ShieldCheck className="mr-2 inline size-4 text-primary" />{vouchPageCopy.invite.summaryRule}</p>
      </SurfaceBody>
    </Surface>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-neutral-800 pb-3 text-sm"><span className="text-neutral-400">{label}</span><span className="font-mono text-white">{value}</span></div>
}

function Notice({ title, body }: { title: string; body: string }) {
  return <div className="mt-7 border border-amber-600 bg-amber-950/10 p-4 text-sm"><strong className="block text-white">{title}</strong><span className="text-neutral-400">{body}</span></div>
}
