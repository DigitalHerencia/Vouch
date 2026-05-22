export default function AuthPageD1() {
  return (
    <main className="h-dvh min-h-0 w-full overflow-hidden">
      <section className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden md:grid-cols-2">
        <div className="hidden min-h-0 md:block">
          <AuthContentPanel />
        </div>

        <div className="min-h-0">
          <SignInFormPanel />
        </div>
      </section>
    </main>
  )
}

function AuthContentPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center overflow-hidden border-r border-neutral-400 bg-black p-6 md:p-8">
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">Section</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">authContent</h2>
          <p className="max-w-prose text-sm leading-6 text-neutral-400">
            Content sits inside consistent padding with balanced X/Y spacing.
          </p>
        </div>
      </div>
    </div>
  )
}

function SignInFormPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden bg-black p-6 pt-24 pb-20 md:p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">Section</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">signInForm</h2>
          <p className="max-w-prose text-sm leading-6 text-neutral-400">
            Content sits inside consistent padding with balanced X/Y spacing.
          </p>
        </div>
      </div>
    </div>
  )
}
