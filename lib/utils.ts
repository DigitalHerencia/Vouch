import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:")) {
    return href
  }

  try {
    const url = new URL(href)
    return ["http:", "https:"].includes(url.protocol) ? href : "#"
  } catch {
    return "#"
  }
}
