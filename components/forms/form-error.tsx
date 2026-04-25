export interface FormErrorProps {
  className?: string
}

export function FormError({ className }: FormErrorProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/forms/form-error.tsx</p>
    </div>
  )
}
