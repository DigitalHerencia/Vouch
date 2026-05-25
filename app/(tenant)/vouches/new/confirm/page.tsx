import { Suspense } from "react"

import { VouchForm } from "@/features/vouches/vouchForm"

import Loading from "../loading"

export default function ConfirmNewVouchRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <VouchForm />
    </Suspense>
  )
}
