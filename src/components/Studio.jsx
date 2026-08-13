import React, { useState } from 'react'
import { useIdentity } from '../context/IdentityContext'
import Icon from './ui/Icon'
import PreviewStage from './studio/PreviewStage'
import ControlPanel from './studio/ControlPanel'
import ExportBar from './studio/ExportBar'
import ShareDialog from './studio/ShareDialog'
import Lightbox from './studio/Lightbox'
import './Studio.css'

/**
 * The whole product on one screen.
 *
 * The brief is explicit: no login wall, no signup gate before the result, one
 * pass from start to finish. So there is no wizard here — the preview renders
 * from the first frame with sensible defaults, and every control edits the
 * thing you are already looking at.
 */
export default function Studio() {
  const { ready } = useIdentity()
  const [sharing, setSharing] = useState(false)
  const [inspecting, setInspecting] = useState(false)

  return (
    <div className="studio">
      <div className="wrap wrap--wide">
        <header className="studio__head">
          <div>
            <p className="eyebrow">Frame studio</p>
            <h1 className="studio__title section-title">
              {ready ? 'Looking good.' : 'Start with a photo.'}
            </h1>
          </div>
          <p className="studio__note">
            <Icon name="lock" size="1em" className="studio__note-icon" />
            <span>Framed on your device — nothing is uploaded unless you share a link.</span>
          </p>
        </header>

        <div className="studio__grid">
          <div className="studio__preview">
            <div className="studio__sticky">
              <PreviewStage onInspect={() => setInspecting(true)} />
              <div className="studio__export">
                <ExportBar onShare={() => setSharing(true)} />
              </div>
            </div>
          </div>

          <aside className="studio__controls" aria-label="Pass settings">
            <ControlPanel />
          </aside>
        </div>
      </div>

      <div className="studio__mobilebar">
        <ExportBar variant="bar" onShare={() => setSharing(true)} />
      </div>

      {sharing && <ShareDialog onClose={() => setSharing(false)} />}
      {inspecting && <Lightbox onClose={() => setInspecting(false)} />}
    </div>
  )
}
