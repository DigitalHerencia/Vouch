export interface ToastMessageProps {
  className?: string
}

export function ToastMessage({ className }: ToastMessageProps) {
  return (
    <div className={className}>
      <p className="text-sm text-neutral-400">components/feedback/toast-message.tsx</p>
    </div>
  )
}
