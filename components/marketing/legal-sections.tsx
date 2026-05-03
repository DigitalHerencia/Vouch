// components/marketing/legal-sections.tsx

import type { ContentSectionListItem } from "@/components/shared/content-section-list"
import { ContentSectionList } from "@/components/shared/content-section-list"

export interface LegalSectionsProps {
    sections: readonly ContentSectionListItem[]
}

export function LegalSections({ sections }: LegalSectionsProps) {
    return <ContentSectionList sections={sections} />
}
