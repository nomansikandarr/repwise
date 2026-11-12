export { cn } from "cn"

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  )
}

/** Prices are whole Pakistani rupees. */
export function formatPrice(rupees: number) {
  return `Rs ${rupees.toLocaleString("en-US")}`
}
