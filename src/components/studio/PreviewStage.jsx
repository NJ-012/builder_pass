import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import Icon from '../ui/Icon'
import { FORMATS, renderCard } from '../../lib/cardRenderer'
import './PreviewStage.css'

export const FORMAT_BY_ID = {
  card: FORMATS.BUILDER_ID,
  pfp: FORMATS.PFP,
  share: FORMATS.SHARE_CARD,
  squad: FORMATS.SQUAD,
}

const SOLO_TABS = [
  { id: 'card', label: 'Builder ID', icon: 'layers' },
  { id: 'pfp', label: 'PFP Frame', icon: 'user' },
  { id: 'share', label: 'Share Card', icon: 'image' },
]

const SQUAD_TABS = [{ id: 'squad', label: 'Squad Pass', icon: 'users' }]

/** Max device pixels we ever render for the on-screen preview. */
const MAX_PREVIEW_SCALE = 1.1

export default function PreviewStage({ onInspect }) {
  const { state, dispatch, ready } = useIdentity()
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const frameRef = useRef(null)
  const rafRef = useRef(0)

  const [scale, setScale] = useState(0.4)
  const [rendering, setRendering] = useState(true)
  const [issued, setIssued] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const dragRef = useRef(null)

  const format = FORMAT_BY_ID[state.format] || FORMATS.BUILDER_ID
  const tabs = state.mode === 'squad' ? SQUAD_TABS : SOLO_TABS
  const canPan = state.mode === 'solo' && Boolean(state.photoDataUrl)

  /* Size the canvas to its container, at device resolution, so the preview is
     as crisp as the export rather than an upscaled thumbnail. */
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const width = el.clientWidth
      if (!width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      setScale(Math.min(MAX_PREVIEW_SCALE, (width * dpr) / format.width))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [format])

  /* Render. Coalesced into a frame so a burst of keystrokes paints once. */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    setRendering(true)

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      renderCard(state, format, canvas, scale)
        .catch(() => {})
        .then(() => {
          if (!cancelled) setRendering(false)
        })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [state, format, scale])

  /* The "issued" sweep — a sub-second flourish the first time a real photo
     lands. Deliberately non-blocking: the result is already on screen. */
  useEffect(() => {
    if (!ready || issued) return
    setIssued(true)
  }, [ready, issued])

  /* — Pan the photo inside the frame — */
  const onPointerDown = useCallback(
    (e) => {
      if (!canPan) return
      dragRef.current = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        cropX: state.photoCrop.x,
        cropY: state.photoCrop.y,
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [canPan, state.photoCrop]
  )

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragRef.current
      if (!drag || drag.id !== e.pointerId) return
      // Pointer deltas are screen pixels; crop offsets live in 1080-space, so
      // divide by the current render scale or the export lands somewhere else.
      const k = scale || 1
      dispatch({
        type: 'SET_CROP',
        payload: {
          x: drag.cropX + (e.clientX - drag.startX) / k,
          y: drag.cropY + (e.clientY - drag.startY) / k,
        },
      })
    },
    [dispatch, scale]
  )

  const endDrag = useCallback((e) => {
    if (dragRef.current?.id === e.pointerId) dragRef.current = null
  }, [])

  /* — Subtle parallax tilt on the card, pointer only — */
  const onMouseMove = (e) => {
    if (dragRef.current || !frameRef.current) return
    const r = frameRef.current.getBoundingClientRect()
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 9
    const rx = -((e.clientY - r.top) / r.height - 0.5) * 9
    setTilt({ rx, ry })
  }

  return (
    <div className="stage">
      <div className="stage__bar">
        <div className="segmented" role="tablist" aria-label="Output format">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              className="segmented__item"
              aria-selected={state.format === t.id}
              onClick={() => dispatch({ type: 'SET_FORMAT', payload: t.id })}
            >
              <Icon name={t.icon} size="1em" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="stage__bar-right">
          <span className={`stage__status ${rendering ? 'stage__status--busy' : ''}`}>
            <span className="badge__dot" />
            {rendering ? 'Rendering' : 'Live'}
          </span>
          <button className="btn btn--ghost btn--sm" onClick={onInspect} aria-label="Inspect full size">
            <Icon name="expand" size="1em" />
            <span className="stage__inspect-label">Inspect</span>
          </button>
        </div>
      </div>

      <div className="stage__canvas-wrap" ref={stageRef}>
        <div
          className="stage__frame"
          ref={frameRef}
          style={{ transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        >
          <canvas
            ref={canvasRef}
            className={`stage__canvas ${canPan ? 'stage__canvas--grab' : ''}`}
            style={{ aspectRatio: `${format.width} / ${format.height}` }}
            role="img"
            aria-label={`${format.label} preview for ${state.name || 'your builder pass'}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          {issued && <span className="stage__sweep" aria-hidden="true" />}
        </div>

        {canPan && (
          <p className="stage__hint mono">
            <Icon name="drag" size="1em" /> Drag the card to reposition your photo
          </p>
        )}
        {!ready && (
          <p className="stage__hint mono">
            <Icon name="info" size="1em" /> Showing a sample — add a photo to make it yours
          </p>
        )}
      </div>
    </div>
  )
}
