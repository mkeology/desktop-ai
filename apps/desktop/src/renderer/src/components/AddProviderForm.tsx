import { useState, type FormEvent } from 'react'
import { useWorkspaceStore } from '../state/useWorkspaceStore'

// Makes the Web Sessions catalog user-extensible — anyone can register an
// arbitrary site, not just the built-in seed list. See
// docs/specs/03-user-guide.md#using-it.
export function AddProviderForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const addCustomProvider = useWorkspaceStore((s) => s.addCustomProvider)

  function reset(): void {
    setName('')
    setUrl('')
    setError(null)
    setOpen(false)
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedUrl = url.trim()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }
    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      setError('Enter a full URL, starting with http:// or https://.')
      return
    }

    addCustomProvider({ name: trimmedName, url: trimmedUrl })
    reset()
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-block justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">+</span> Add website
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-box border border-base-300 p-2">
      <input
        autoFocus
        type="text"
        placeholder="Name (e.g. Linear)"
        className="input input-sm input-bordered w-full"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="text"
        placeholder="https://example.com"
        className="input input-sm input-bordered w-full"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-xs" onClick={reset}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-xs">
          Add
        </button>
      </div>
    </form>
  )
}
