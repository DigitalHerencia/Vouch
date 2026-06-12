import { authFormContent } from "@/content/auth"

export function AuthFooter() {
  return (
    <footer className="px-6 py-4 md:px-10">
      <p className="font-mono text-xs text-neutral-400 md:text-sm">
        Copyright &copy; {new Date().getFullYear()}
        <span className="font-bold text-blue-600"> {authFormContent.footer.brand}</span>
        <span className="mx-2 text-neutral-400"> {authFormContent.footer.rights}</span>
      </p>
    </footer>
  )
}
