import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SettingsWindow } from './SettingsWindow'
import './index.css'

// One renderer bundle serves both windows main creates — the ?view= query
// param (set in src/main/index.ts) picks which one to render.
const isSettingsWindow = new URLSearchParams(window.location.search).get('view') === 'settings'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>{isSettingsWindow ? <SettingsWindow /> : <App />}</React.StrictMode>
)
