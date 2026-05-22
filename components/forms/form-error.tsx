export function FormError({ message }: { message?: string | null }) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm text-red-600"
    >
      {message}
    </p>
  )
}
