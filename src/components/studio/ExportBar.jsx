import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useToast } from '../ui/Toast'
import Icon, { XLogo } from '../ui/Icon'
import { FORMAT_BY_ID } from './PreviewStage'
import { FORMATS, exportCard, generateIdentityDNA } from '../../lib/cardRenderer'
import { downloadBlob, slugify } from '../../lib/sharing'
import './ExportBar.css'

export default function ExportBar({ onShare, variant = 'panel' }) {
  const { state, dispatch, ready } = useIdentity()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const format = FORMAT_BY_ID[state.format] || FORMATS.BUILDER_ID
  const dna = generateIdentityDNA(state)

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    setDone(false)
    try {
      const blob = await exportCard(state, format)
      const who = state.mode === 'squad' ? state.teamName : state.name
      downloadBlob(blob, `hh-goa-${slugify(who)}-${format.id}.png`)
      if (!alive.current) return
      setDone(true)
      toast({
        tone: 'ok',
        title: 'PNG saved',
        desc: `${format.label} at ${format.width * 2} × ${format.height * 2}px.`,
      })
      setTimeout(() => alive.current && setDone(false), 2600)
    } catch {
      toast({ tone: 'err', title: 'Export failed', desc: 'Try again, or reload if it persists.' })
    } finally {
      if (alive.current) setDownloading(false)
    }
  }, [state, format, toast])

  return (
    <div className={`export export--${variant}`}>
      <div className="export__actions">
        <button
          className="btn btn--primary export__primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <Icon name={done ? 'check' : 'download'} size="1.05em" className="btn__icon" />
          )}
          {downloading ? 'Exporting…' : done ? 'Saved' : 'Download PNG'}
        </button>

        <button className="btn btn--pink export__share" onClick={onShare}>
          <XLogo size="0.95em" />
          Share to X
        </button>

        {variant === 'panel' && (
          <button
            className="btn btn--ghost export__reset"
            onClick={() => {
              dispatch({ type: 'RESET' })
              toast({ tone: 'info', title: 'Cleared', desc: 'Start fresh with a new photo.' })
            }}
          >
            <Icon name="refresh" size="1em" />
            Start over
          </button>
        )}
      </div>

      {variant === 'panel' && (
        <div className="export__meta">
          <span className="export__serial mono">{dna.identityCode}</span>
          <span className="export__dims mono">
            {format.width * 2} × {format.height * 2} PNG · {dna.editionName}
          </span>
          {!ready && (
            <span className="export__warn mono">
              <Icon name="info" size="0.95em" /> Add a photo for the real thing
            </span>
          )}
        </div>
      )}
    </div>
  )
}
