import type { ToasterProps } from "sonner"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster(props: ToasterProps) {
  return <SonnerToaster className="toaster group" toastOptions={{ classNames: { toast: "rounded-none border border-neutral-800 bg-black text-white", success: "rounded-none border-emerald-800 bg-emerald-950 text-emerald-100", error: "rounded-none border-red-800 bg-red-950 text-red-100" } }} {...props} />
}