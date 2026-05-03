// components/marketing/use-case-grid.tsx

import { CardGrid } from "@/components/shared/card-grid"
import { landingUseCases } from "@/content/marketing"

export function UseCaseGrid() {
    return (
        <CardGrid
            items={landingUseCases}
            className="mt-9"
        />
    )
}

