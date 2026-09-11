import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from './ChevronDownIcon'

export interface SidebarAccordionItem {
  key: string
  label: string
  sublabel?: string
  onSelect: () => void
  /** Highlighted as the currently open/active session for this item. */
  isActive?: boolean
  /**
   * A single trailing icon-button. "Close" when this item has an open
   * session, "Remove" for a user-added catalog entry that doesn't — never
   * both at once, so there's only ever one slot to reason about.
   */
  trailingAction?: { label: string; onClick: () => void }
}

interface SidebarAccordionProps {
  icon: string
  label: string
  items: SidebarAccordionItem[]
  forceOpen: boolean
  defaultOpen?: boolean
  footer?: ReactNode
}

function initialsAvatar(label: string): { letter: string; hue: number } {
  let hash = 0
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return { letter: label.trim().charAt(0).toUpperCase(), hue: hash }
}

// One "concertina" section of the sidebar (Web / API / Terminal) — expands
// in place rather than as a floating popover, per docs/specs/03-user-guide.md.
export function SidebarAccordion({
  icon,
  label,
  items,
  forceOpen,
  defaultOpen = false,
  footer
}: SidebarAccordionProps) {
  const [manuallyOpen, setManuallyOpen] = useState(defaultOpen)
  const isOpen = forceOpen || manuallyOpen

  return (
    <div className="border-b border-base-300 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-base-300/50"
        onClick={() => setManuallyOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span aria-hidden="true">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <span className="text-xs text-base-content/50">{items.length}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <ul className="menu menu-sm gap-1 p-1 pb-2">
            {items.length === 0 && <li className="px-2 py-1 text-sm text-base-content/50">No matches</li>}
            {items.map((item) => {
              const { letter, hue } = initialsAvatar(item.label)
              return (
                <li key={item.key}>
                  <button
                    className={`flex items-center gap-2 ${item.isActive ? 'active bg-base-300 font-medium' : ''}`}
                    onClick={item.onSelect}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: `hsl(${hue}, 60%, 45%)` }}
                      aria-hidden="true"
                    >
                      {letter}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="truncate">{item.label}</span>
                      {item.sublabel && (
                        <span className="truncate text-xs text-base-content/50">{item.sublabel}</span>
                      )}
                    </span>
                    {item.trailingAction && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={item.trailingAction.label}
                        title={item.trailingAction.label}
                        className="shrink-0 opacity-60 hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          item.trailingAction?.onClick()
                        }}
                      >
                        ✕
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          {footer && <div className="px-1 pb-2">{footer}</div>}
        </>
      )}
    </div>
  )
}
