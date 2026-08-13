import React, { useEffect } from 'react'
import { IdentityProvider, useIdentity } from './context/IdentityContext'
import { ToastProvider } from './components/ui/Toast'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import Landing from './components/Landing'
import Studio from './components/Studio'
import './App.css'

function AppContent() {
  const { state } = useIdentity()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [state.view])

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />

      <SiteHeader />

      <main id="main" className="app__main" key={state.view}>
        {state.view === 'studio' ? <Studio /> : <Landing />}
      </main>

      <SiteFooter />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <IdentityProvider>
        <AppContent />
      </IdentityProvider>
    </ToastProvider>
  )
}
