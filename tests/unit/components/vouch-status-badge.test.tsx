import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { VouchStatusBadge } from "@/components/vouches/vouch-status-badge"

describe("VouchStatusBadge", () => {
  it("renders visible text for status", () => {
    render(<VouchStatusBadge status="active" />)

    expect(screen.getByText(/active/i)).toBeInTheDocument()
  })

  it("does not rely on color alone", () => {
    render(<VouchStatusBadge status="failed" />)

    expect(screen.getByText(/failed/i)).toBeInTheDocument()
  })
})
