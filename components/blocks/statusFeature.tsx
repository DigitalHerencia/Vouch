import {
  VouchCountdown,
  VouchStatusBadge,
  VouchStatusDocument,
  VouchStatusTimeline,
} from "@/components/blocks/status"
import { StatusFeatureClient } from "@/components/blocks/statusFeatureClient"
import { presentationContent } from "@/components/(presentation)/presentationContent"
import {
  createStatusPreviewVouch,
  fetchStatusPreview,
  saveStatusPreviewAmount,
  saveStatusPreviewWindow,
} from "@/components/(presentation)/presentationOperations"

export async function StatusFeature() {
  // Feature orchestration: fetch DTOs, bind server operations, compose client and UI blocks.
  const preview = await fetchStatusPreview()

  return (
    <main className="p-8 md:p-12">
      <section className="grid gap-8 md:gap-16">
        <header className="max-w-3xl">
          <p className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            {presentationContent.page.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl leading-none font-black tracking-wide uppercase md:text-6xl">
            {presentationContent.page.title}
          </h1>
          <p className="mt-4 text-sm leading-6 font-semibold text-neutral-400 md:text-base">
            {presentationContent.page.description}
          </p>
        </header>

        <StatusFeatureClient
          initialDraft={preview.initialDraft}
          onSaveAmount={saveStatusPreviewAmount}
          onSaveWindow={saveStatusPreviewWindow}
          onCreateVouch={createStatusPreviewVouch}
        />

        <VouchStatusDocument data={preview.document} />
        <VouchStatusTimeline items={preview.timeline} />
        {preview.document.countdown ? <VouchCountdown {...preview.document.countdown} /> : null}
        <div>
          <VouchStatusBadge
            status={preview.document.status}
            tone={preview.document.statusTone ?? "pending"}
          />
        </div>
      </section>
    </main>
  )
}
