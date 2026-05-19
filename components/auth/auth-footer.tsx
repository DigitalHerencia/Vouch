// components/auth/auth-footer.tsx

export function AuthFooter() {
  return (
    <footer className="px-6 py-4 md:px-10">
      <p className="font-mono text-xs text-neutral-400 md:text-sm">
        Copyright &copy; {new Date().getFullYear()}
        <span className="font-bold text-blue-600"> Vouch</span>
        <span className="mx-2 text-neutral-400"> All rights reserved.</span>
      </p>
    </footer>
  )
}
