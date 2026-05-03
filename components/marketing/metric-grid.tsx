// components/marketing/metric-grid.tsx

import { MetricGrid as SharedMetricGrid } from "@/components/shared/metric-grid"
import { landingMetrics } from "@/content/marketing"

export function MetricGrid() {
    return (
        <SharedMetricGrid
            items={landingMetrics}
            className="mt-14"
        />
    )
}

