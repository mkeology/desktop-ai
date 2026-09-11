import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface TerminalViewProps {
  sessionId: string
}

// A real local shell (node-pty in main, see src/main/terminalSessions.ts) —
// this component owns the xterm.js view; the shell process itself keeps
// running in the background across mount/unmount (switching tabs), so only
// the on-screen scrollback resets when this remounts, not the session.
export function TerminalView({ sessionId }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      theme: { background: '#00000000' }
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(container)
    fitAddon.fit()

    window.api.openTerminal(sessionId)

    const unsubscribeData = window.api.onTerminalData(({ sessionId: id, data }) => {
      if (id === sessionId) term.write(data)
    })
    const inputDisposable = term.onData((data) => window.api.sendTerminalInput(sessionId, data))

    function reportSize(): void {
      fitAddon.fit()
      window.api.resizeTerminal(sessionId, term.cols, term.rows)
    }
    const resizeObserver = new ResizeObserver(reportSize)
    resizeObserver.observe(container)
    reportSize()

    return () => {
      resizeObserver.disconnect()
      inputDisposable.dispose()
      unsubscribeData()
      term.dispose()
    }
  }, [sessionId])

  return <div ref={containerRef} className="h-full w-full p-2" />
}
