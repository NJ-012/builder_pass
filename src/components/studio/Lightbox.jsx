import React, { useEffect, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import Icon from '../ui/Icon'
import { FORMAT_BY_ID } from './PreviewStage'
import { FORMATS, generateIdentityDNA, renderCard } from '../../lib/cardRenderer'
import './Lightbox.css'

export default function Lightbox({ onClose }) {
  const { state } = useIdentity()
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)

  const format = FORMAT_BY_ID[state.format] || FORMATS.BUILDER_ID
  const dna = generateIdentityDNA(state)

  useEffect(() => {
    let cancelled = false
    if (canvasRef.current) {
      renderCard(state, format, canvasRef.current, 1).then(() => {
        if (!cancelled) setReady(true)
      })
    }
    return () => {
      cancelled = true
    }
  }, [state, format])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="overlay lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Full size artwork"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="lightbox__inner">
        <header className="lightbox__head">
          <span className="mono">
            {format.label} · {format.width} × {format.height}
          </span>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size="1.05em" />
          </button>
        </header>

        <div className="lightbox__frame">
          {!ready && <div className="skeleton lightbox__skeleton" />}
          <canvas
            ref={canvasRef}
            className="lightbox__canvas"
            style={{
              aspectRatio: `${format.width} / ${format.height}`,
              opacity: ready ? 1 : 0,
            }}
            role="img"
            aria-label="Full size preview"
          />
        </div>

        <p className="lightbox__foot mono">{dna.identityCode}</p>
      </div>
    </div>
  )
}
