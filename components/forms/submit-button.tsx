export interface SubmitButtonProps {
  className?: string
}

export function SubmitButton({ className }: SubmitButtonProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/forms/submit-button.tsx</p>
    </div>
  )
}
