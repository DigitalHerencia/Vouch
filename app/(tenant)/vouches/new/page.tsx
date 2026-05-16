import { Suspense } from "react"
import { CreateVouchPageSkeleton } from "@/components/vouches/create-vouch-page-skeleton"
import { CreateVouchPage } from "@/features/vouches/create-vouch-page"

export default function Page() {
  return <Suspense fallback={<CreateVouchPageSkeleton />}><CreateVouchPage /></Suspense>
}