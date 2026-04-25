export interface FormSectionProps {
  className?: string
}

export function FormSection({ className }: FormSectionProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/forms/form-section.tsx</p>
    </div>
  )
}
