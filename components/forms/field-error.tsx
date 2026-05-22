export function FieldError({
  id,
  message,
}: {
  id?: string
  message?: string | null
}) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="text-sm text-red-600">
      {message}
    </p>
  )
}
