import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useToast } from '../ui/Toast'
import Icon, { XLogo } from '../ui/Icon'
import { FORMAT_BY_ID } from './PreviewStage'
import { FORMATS, exportCard } from '../../lib/cardRenderer'
import {
  buildCaption,
  buildXIntentUrl,
  canShareFiles,
  copyText,
  downloadBlob,
  shareNative,
  slugify,
  uploadShareArtifact,
} from '../../lib/sharing'
import './ShareDialog.css'

/**
 * Share sheet.
 *
 * Two routes to X, picked automatically:
 *   • attach — the PNG goes into the post itself (native share sheet)
 *   • link   — a permalink whose OG image is the generated graphic
 *
 * Whichever route is available, the caption is pre-written with #FrameInGoa
 * and stays editable, because a caption you can't change isn't really yours.
 */
export default function ShareDialog({ onClose }) {
  const { state } = useIdentity()
  const { toast } = useToast()
  const dialogRef = useRef(null)
  const alive = useRef(true)

  const [status, setStatus] = useState('preparing') // preparing | link | attach-only | error
  const [caption, setCaption] = useState('')
  const [permalink, setPermalink] = useState('')
  const [thumb, setThumb] = useState('')
  const [postBlob, setPostBlob] = useState(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState('')

  const format = FORMAT_BY_ID[state.format] || FORMATS.BUILDER_ID
  const fileName = `hh-goa-${slugify(state.mode === 'squad' ? state.teamName : state.name)}-${format.id}.png`

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  /* Prepare: render the post image, then try to mint a permalink for the
     link-preview route. The dialog stays usable either way. */
  useEffect(() => {
    let objectUrl = ''

    ;(async () => {
      try {
        const blob = await exportCard(state, format)
        if (!alive.current) return
        setPostBlob(blob)
        objectUrl = URL.createObjectURL(blob)
        setThumb(objectUrl)

        const base = {
          name: state.name,
          builderTitle: state.builderTitle,
          stack: state.stack,
          mode: state.mode,
          teamName: state.teamName,
        }

        try {
          // The link preview must be the wide crop — X renders link cards at 1.91:1.
          const ogBlob =
            format === FORMATS.SHARE_CARD ? blob : await exportCard(state, FORMATS.SHARE_CARD)
          const url = await uploadShareArtifact(ogBlob, {
            name: state.mode === 'squad' ? state.teamName : state.name,
            title: state.builderTitle,
          })
          if (!alive.current) return
          setPermalink(url)
          setCaption(buildCaption({ ...base, url }))
          setStatus('link')
        } catch {
          if (!alive.current) return
          setCaption(buildCaption(base))
          setStatus('attach-only')
        }
      } catch {
        if (alive.current) setStatus('error')
      }
    })()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // Snapshot the identity once — editing behind an open dialog would be odd.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Focus trap + escape */
  useEffect(() => {
    const node = dialogRef.current
    node?.querySelector('textarea, button')?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll('button, textarea, a[href]')].filter(
        (el) => !el.disabled
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCopy = useCallback(async () => {
    try {
      await copyText(caption)
      setCopied(true)
      setTimeout(() => alive.current && setCopied(false), 2200)
    } catch {
      toast({ tone: 'err', title: 'Copy failed', desc: 'Select the caption and copy it manually.' })
    }
  }, [caption, toast])

  const handleNative = useCallback(async () => {
    if (!postBlob) return
    setBusy('native')
    try {
      await shareNative(postBlob, fileName, caption)
      toast({ tone: 'ok', title: 'Handed off to your share sheet' })
      onClose()
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast({ tone: 'err', title: 'Share sheet unavailable', desc: 'Use Open X composer instead.' })
      }
    } finally {
      if (alive.current) setBusy('')
    }
  }, [postBlob, fileName, caption, toast, onClose])

  const handleOpenX = useCallback(() => {
    // Without a permalink X has nothing to render, so hand the user the file
    // to attach rather than letting them post a bare caption.
    if (!permalink && postBlob) downloadBlob(postBlob, fileName)
    window.open(buildXIntentUrl(caption, permalink), '_blank', 'noopener,noreferrer')
    toast({
      tone: 'ok',
      title: 'X composer opened',
      desc: permalink ? 'Your caption and preview are attached.' : 'Attach the PNG we just saved.',
    })
  }, [permalink, postBlob, fileName, caption, toast])

  const preparing = status === 'preparing'
  const nativeAvailable = postBlob && canShareFiles(postBlob)

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="dialog share"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        ref={dialogRef}
      >
        <header className="dialog__head">
          <div>
            <h2 className="dialog__title" id="share-title">
              Post it
            </h2>
            <p className="dialog__sub">
              Caption is written and carries <b className="text-sun">#FrameInGoa</b> — edit anything
              you like.
            </p>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size="1.05em" />
          </button>
        </header>

        <div className="dialog__body share__body">
          <div className="share__preview">
            {thumb ? (
              <img src={thumb} alt="The graphic you are about to post" />
            ) : (
              <div className="skeleton share__preview-skeleton" />
            )}
          </div>

          <div className="share__main">
            <label className="field">
              <div className="field__label">
                <span className="field__name">Caption</span>
                <span className="field__hint">{caption.length}/280</span>
              </div>
              <textarea
                className="input textarea share__caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={280}
                spellCheck="false"
                disabled={preparing}
                aria-label="Post caption"
              />
            </label>

            {preparing && (
              <p className="note">
                <span className="spinner note__icon" aria-hidden="true" />
                <span>Rendering your image and preparing the link preview…</span>
              </p>
            )}

            {status === 'link' && (
              <p className="note note--ok">
                <Icon name="check" size="1.05em" className="note__icon" />
                <span>
                  Link preview ready — the card X shows will be your graphic, not a blank
                  thumbnail.
                </span>
              </p>
            )}

            {status === 'attach-only' && (
              <p className="note note--warn">
                <Icon name="info" size="1.05em" className="note__icon" />
                <span>
                  Link previews aren’t configured on this deployment.{' '}
                  {nativeAvailable
                    ? 'Use the share sheet to attach the image directly.'
                    : 'Opening X will save the PNG so you can attach it in the composer.'}
                </span>
              </p>
            )}

            {status === 'error' && (
              <p className="note note--err">
                <Icon name="alert" size="1.05em" className="note__icon" />
                <span>Something went wrong rendering the image. Close this and try again.</span>
              </p>
            )}
          </div>
        </div>

        <footer className="dialog__foot share__foot">
          {nativeAvailable && (
            <button
              className="btn btn--primary"
              onClick={handleNative}
              disabled={preparing || busy === 'native'}
            >
              {busy === 'native' ? <span className="spinner" /> : <Icon name="share" size="1em" />}
              Share with image
            </button>
          )}

          <button
            className={nativeAvailable ? 'btn btn--outline' : 'btn btn--pink'}
            onClick={handleOpenX}
            disabled={preparing || status === 'error'}
          >
            <XLogo size="0.95em" />
            Open X composer
          </button>

          <button className="btn btn--ghost" onClick={handleCopy} disabled={preparing}>
            <Icon name={copied ? 'check' : 'copy'} size="1em" />
            {copied ? 'Copied' : 'Copy caption'}
          </button>

          <button
            className="btn btn--ghost"
            onClick={() => postBlob && downloadBlob(postBlob, fileName)}
            disabled={!postBlob}
          >
            <Icon name="download" size="1em" />
            Save PNG
          </button>
        </footer>
      </div>
    </div>
  )
}
