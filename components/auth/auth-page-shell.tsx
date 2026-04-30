import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export interface AuthPageShellProps {
  children: React.ReactNode
  eyebrow: string
  title: string
  description: string
  footnote: string
}

export function AuthPageShell({
  children,
  eyebrow,
  title,
  description,
  footnote,
}: AuthPageShellProps) {
  return (
    <main className="grid min-h-svh bg-neutral-950 text-neutral-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-neutral-800 bg-neutral-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,rgba(23,23,23,1),rgba(10,10,10,1))]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2 text-neutral-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-600/15 text-blue-300">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Vouch</span>
          </Link>
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">
              {eyebrow}
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-neutral-50">{title}</h1>
            <p className="mt-6 text-base leading-7 text-neutral-300">{description}</p>
          </div>
          <p className="max-w-lg text-sm leading-6 text-neutral-500">{footnote}</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  )
}
