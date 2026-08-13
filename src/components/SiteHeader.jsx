import React from 'react'
import { useIdentity } from '../context/IdentityContext'
import Icon, { Wordmark } from './ui/Icon'

export default function SiteHeader() {
  const { state, setView } = useIdentity()
  const inStudio = state.view === 'studio'

  return (
    <header className="head">
      <div className="wrap wrap--wide head__inner">
        <button
          className="head__brand"
          onClick={() => setView('landing')}
          aria-label="Hacker House Goa 2026 — home"
        >
          <span className="head__seal" aria-hidden="true">
            HH
          </span>
          <Wordmark />
        </button>

        {inStudio ? (
          <div className="head__actions">
            <span className="head__meta">Frame Studio · No signup</span>
            <button className="btn btn--outline btn--sm" onClick={() => setView('landing')}>
              <Icon name="arrowLeft" size="1em" className="btn__icon" />
              Back
            </button>
          </div>
        ) : (
          <>
            <nav className="head__nav" aria-label="Sections">
              <a className="head__link" href="#how">
                How it works
              </a>
              <a className="head__link" href="#formats">
                Formats
              </a>
              <a className="head__link" href="#faq">
                FAQ
              </a>
            </nav>
            <div className="head__actions">
              <button className="btn btn--primary btn--sm" onClick={() => setView('studio')}>
                Open the studio
                <Icon name="arrowRight" size="1em" className="btn__icon" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
