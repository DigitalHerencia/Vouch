export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="min-h-dvh w-full overflow-x-hidden bg-transparent text-foreground">{children}</div>
}
