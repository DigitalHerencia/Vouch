import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SetupChecklist } from "@/components/setup/setup-checklist"

describe("SetupChecklist", () => {
  it("renders setup requirements with labels", () => {
    render(
      <SetupChecklist
        items={[
          {
            id: "identity",
            description: "Required before payment-bearing flows.",
            status: "complete",
            title: "",
          },
          {
            id: "payout",
            description: "Required before accepting Vouches.",
            status: "blocked",
            title: "",
          },
        ]}
      />
    )

    expect(screen.getByText("Identity verification")).toBeInTheDocument()
    expect(screen.getByText("Payout setup")).toBeInTheDocument()
    expect(screen.getByText("Connect payout account")).toBeInTheDocument()
  })
})
