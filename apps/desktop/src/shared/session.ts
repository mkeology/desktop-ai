// The Session abstraction from docs/specs/04-architecture.md — every open
// activity (a logged-in provider site, an API chat, a terminal) is a Session.
// New capabilities should extend this union rather than bypass it.

export type SessionType = 'web' | 'api' | 'terminal'

interface BaseSession {
  id: string
  name: string
  workspaceId: string
  type: SessionType
}

export interface WebSession extends BaseSession {
  type: 'web'
  providerId: string
  accountId: string
  url: string
}

export interface ApiSession extends BaseSession {
  type: 'api'
  provider: string
  model: string
}

export interface TerminalSession extends BaseSession {
  type: 'terminal'
  shell: string
  cwd: string
}

export type Session = WebSession | ApiSession | TerminalSession
