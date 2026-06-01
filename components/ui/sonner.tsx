import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-3 group-[.toaster]:border-neutral-400 group-[.toaster]:shadow-[8px_8px_0px_oklch(54.6%_0.245_262.881)] group-[.toaster]:rounded-none group-[.toaster]:font-bold",
          title: "group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-wide",
          description: "group-[.toast]:text-neutral-400 group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:border-2 group-[.toast]:border-neutral-400 group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:rounded-none group-[.toast]:shadow-[2px_2px_0px_oklch(54.6%_0.245_262.881)] group-[.toast]:hover:translate-x-[2px] group-[.toast]:hover:translate-y-[2px] group-[.toast]:hover:shadow-none group-[.toast]:transition-all",
          cancelButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-400 group-[.toast]:border-2 group-[.toast]:border-neutral-400 group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:rounded-none",
          success:
            "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-neutral-400",
          error:
            "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-neutral-400",
          warning:
            "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-neutral-400",
          info: "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-neutral-400",
          closeButton:
            "group-[.toast]:border-2 group-[.toast]:border-neutral-400 group-[.toast]:bg-black group-[.toast]:text-white group-[.toast]:hover:bg-neutral-900 group-[.toast]:rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
