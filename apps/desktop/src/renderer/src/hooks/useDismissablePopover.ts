import { useEffect, useRef, useState } from 'react'

// Shared by the sidebar's "+ New Session" picker and its bottom settings
// menu — closes on an outside click or Escape.
export function useDismissablePopover<T extends HTMLElement>(): {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  ref: React.RefObject<T | null>
} {
  const [open, setOpen] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return { open, setOpen, toggle: () => setOpen((prev) => !prev), ref }
}
