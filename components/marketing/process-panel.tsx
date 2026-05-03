// components/marketing/process-panel.tsx

import { ProcessPanel as SharedProcessPanel } from "@/components/shared/process-panel"
import { landingProcessSteps } from "@/content/marketing"

export function ProcessPanel() {
    return (
        <SharedProcessPanel
            title="The Vouch Process"
            steps={landingProcessSteps}
            footer="No confirmation = refund / void"
        />
    )
}

