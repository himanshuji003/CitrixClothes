import * as React from "react"

/**
 * VisuallyHidden wraps content that should be announced to screen readers
 * but not visible on screen. Uses the sr-only (screen-reader-only) pattern.
 * 
 * Useful for DialogTitle/DialogDescription or SheetTitle/SheetDescription
 * that should not be visually displayed.
 */
const VisuallyHidden = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className="sr-only"
    {...props}
  />
))
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
