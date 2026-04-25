import { Button } from "@/components/ui/button"

export function SubmitButton({
  pending = false,
  pendingLabel = "Working…",
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  pending?: boolean
  pendingLabel?: string
}) {
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending || props.disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  )
}
