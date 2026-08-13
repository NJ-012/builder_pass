import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { ACCEPT_ATTR, prepareImage } from '../../lib/imageUtils'
import './UploadPad.css'

/**
 * One upload surface, used in the hero and in the studio. Accepts drag-drop,
 * a file picker, and a pasted image — and reports a normalised result, so no
 * caller has to know about HEIC, EXIF or downscaling.
 */
export default function UploadPad({
  onPick,
  onError,
  variant = 'full', // 'full' | 'compact' | 'slot'
  title = 'Drop a photo',
  hint = 'JPG · PNG · WEBP · HEIC — any shape, no cropping needed',
  listenForPaste = false,
  className = '',
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      setError('')
      setBusy(true)
      try {
        const result = await prepareImage(file)
        if (!alive.current) return
        onPick({ file, ...result })
      } catch (err) {
        if (!alive.current) return
        const message = err?.message || 'That photo could not be processed.'
        setError(message)
        onError?.(message)
      } finally {
        if (alive.current) setBusy(false)
      }
    },
    [onPick, onError]
  )

  useEffect(() => {
    if (!listenForPaste) return
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))
      if (item) handleFile(item.getAsFile())
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [listenForPaste, handleFile])

  const open = () => !busy && inputRef.current?.click()

  return (
    <div className={`pad pad--${variant} ${className}`}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <button
        type="button"
        className={`pad__drop ${dragging ? 'pad__drop--over' : ''} ${busy ? 'pad__drop--busy' : ''}`}
        onClick={open}
        disabled={busy}
        aria-describedby={error ? `${inputId}-err` : undefined}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer?.files?.[0])
        }}
      >
        <span className="pad__corner pad__corner--tl" aria-hidden="true" />
        <span className="pad__corner pad__corner--tr" aria-hidden="true" />
        <span className="pad__corner pad__corner--bl" aria-hidden="true" />
        <span className="pad__corner pad__corner--br" aria-hidden="true" />

        {busy ? (
          <span className="pad__state">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <span className="pad__title">Reading your photo…</span>
            <span className="pad__hint">Straightening it and sizing it down for speed</span>
          </span>
        ) : (
          <span className="pad__state">
            <span className="pad__icon" aria-hidden="true">
              <Icon name={variant === 'slot' ? 'plus' : 'upload'} size="1.5em" strokeWidth={1.6} />
            </span>
            <span className="pad__title">{title}</span>
            {hint && <span className="pad__hint">{hint}</span>}
          </span>
        )}
      </button>

      {error && (
        <p className="note note--err pad__error" id={`${inputId}-err`} role="alert">
          <Icon name="alert" size="1.05em" className="note__icon" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
