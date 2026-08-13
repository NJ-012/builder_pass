import React, { useCallback, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useToast } from '../ui/Toast'
import Icon from '../ui/Icon'
import UploadPad from './UploadPad'
import { STACKS } from '../../constants/stacks'
import { ENERGIES } from '../../constants/energies'
import { STYLES } from '../../constants/styles'
import { generateTitle, countTitles } from '../../lib/titleEngine'
import { ACCEPT_ATTR, prepareImage } from '../../lib/imageUtils'
import './ControlPanel.css'

function Section({ n, title, hint, children, action }) {
  return (
    <section className="ctrl__section">
      <header className="ctrl__section-head">
        <div>
          <h2 className="ctrl__section-title">
            <span className="ctrl__section-n mono">{n}</span>
            {title}
          </h2>
          {hint && <p className="ctrl__section-hint">{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

/* ── Solo photo controls ──────────────────────────────────────────────── */

function PhotoBlock() {
  const { state, dispatch } = useIdentity()
  const { toast } = useToast()

  const onPick = useCallback(
    ({ file, dataUrl, width, height, aspect }) => {
      dispatch({ type: 'SET_PHOTO', payload: { file, dataUrl, meta: { width, height, aspect } } })
      toast({ tone: 'ok', title: 'Photo loaded', desc: 'Framed and ready.' })
    },
    [dispatch, toast]
  )

  if (!state.photoDataUrl) {
    return (
      <UploadPad
        variant="compact"
        onPick={onPick}
        listenForPaste
        title="Drop a photo or tap to choose"
        hint="Any shape · HEIC welcome"
        onError={(msg) => toast({ tone: 'err', title: 'Could not use that photo', desc: msg })}
      />
    )
  }

  const { width, height } = state.photoMeta || {}
  const orientation =
    width && height ? (width > height ? 'Landscape' : width < height ? 'Portrait' : 'Square') : ''

  return (
    <div className="photo-block">
      <div className="photo-block__top">
        <img className="photo-block__thumb" src={state.photoDataUrl} alt="Your uploaded photo" />
        <div className="photo-block__meta">
          <p className="photo-block__name">{state.photoFile?.name || 'Your photo'}</p>
          <p className="photo-block__dims mono">
            {orientation}
            {width ? ` · ${width}×${height}` : ''}
          </p>
          <div className="photo-block__actions">
            <label className="btn btn--outline btn--sm photo-block__swap">
              <Icon name="refresh" size="1em" />
              Replace
              <input
                type="file"
                accept={ACCEPT_ATTR}
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    const result = await prepareImage(file)
                    onPick({ file, ...result })
                  } catch (err) {
                    toast({ tone: 'err', title: 'Could not use that photo', desc: err.message })
                  }
                }}
              />
            </label>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => dispatch({ type: 'SET_PHOTO', payload: { file: null, dataUrl: '' } })}
            >
              <Icon name="trash" size="1em" />
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="field zoom">
        <div className="field__label">
          <span className="field__name">Zoom</span>
          <span className="field__hint">{Math.round(state.photoCrop.scale * 100)}%</span>
        </div>
        <input
          className="range"
          type="range"
          min="0.6"
          max="2.6"
          step="0.02"
          value={state.photoCrop.scale}
          aria-label="Photo zoom"
          style={{ '--range-pos': `${((state.photoCrop.scale - 0.6) / 2) * 100}%` }}
          onChange={(e) =>
            dispatch({ type: 'SET_CROP', payload: { scale: parseFloat(e.target.value) } })
          }
        />
        <button
          className="btn btn--ghost btn--sm zoom__reset"
          onClick={() => dispatch({ type: 'SET_CROP', payload: { x: 0, y: 0, scale: 1 } })}
        >
          <Icon name="crop" size="1em" />
          Recentre
        </button>
      </div>
    </div>
  )
}

/* ── Squad member roster ──────────────────────────────────────────────── */

function SquadBlock() {
  const { state, dispatch } = useIdentity()
  const { toast } = useToast()
  const inputs = useRef({})

  const setMember = (id, patch) => dispatch({ type: 'UPDATE_MEMBER', payload: { id, patch } })

  const handleFile = async (id, file) => {
    if (!file) return
    try {
      const { dataUrl } = await prepareImage(file)
      setMember(id, { dataUrl })
    } catch (err) {
      toast({ tone: 'err', title: 'Could not use that photo', desc: err.message })
    }
  }

  return (
    <div className="squad">
      <ul className="squad__list">
        {state.squad.map((m, i) => (
          <li className="squad__row" key={m.id}>
            <button
              type="button"
              className={`squad__slot ${m.dataUrl ? 'squad__slot--filled' : ''}`}
              onClick={() => inputs.current[m.id]?.click()}
              aria-label={m.dataUrl ? `Replace photo for member ${i + 1}` : `Add photo for member ${i + 1}`}
            >
              {m.dataUrl ? (
                <img src={m.dataUrl} alt="" />
              ) : (
                <Icon name="plus" size="1.15em" strokeWidth={2} />
              )}
              <span className="squad__slot-n mono">{String(i + 1).padStart(2, '0')}</span>
            </button>

            <input
              ref={(el) => (inputs.current[m.id] = el)}
              type="file"
              accept={ACCEPT_ATTR}
              className="sr-only"
              onChange={(e) => {
                handleFile(m.id, e.target.files?.[0])
                e.target.value = ''
              }}
            />

            <input
              className="input squad__name"
              placeholder={`Teammate ${i + 1}`}
              value={m.name}
              maxLength={18}
              onChange={(e) => setMember(m.id, { name: e.target.value })}
              aria-label={`Name for member ${i + 1}`}
            />

            <button
              className="squad__remove"
              onClick={() => dispatch({ type: 'REMOVE_MEMBER', payload: m.id })}
              disabled={state.squad.length <= 1}
              aria-label={`Remove member ${i + 1}`}
            >
              <Icon name="close" size="1em" />
            </button>
          </li>
        ))}
      </ul>

      {state.squad.length < 4 ? (
        <button className="btn btn--outline btn--sm btn--block" onClick={() => dispatch({ type: 'ADD_MEMBER' })}>
          <Icon name="plus" size="1em" />
          Add teammate ({state.squad.length}/4)
        </button>
      ) : (
        <p className="note">
          <Icon name="info" size="1.05em" className="note__icon" />
          <span>Four is the crew limit — any more and faces get too small to read.</span>
        </p>
      )}
    </div>
  )
}

/* ── Panel ────────────────────────────────────────────────────────────── */

export default function ControlPanel() {
  const { state, dispatch } = useIdentity()
  const [titleOffset, setTitleOffset] = useState(0)
  const isSquad = state.mode === 'squad'

  const reroll = () => {
    const next = titleOffset + 1
    setTitleOffset(next)
    dispatch({ type: 'SET_TITLE', payload: generateTitle(state.stack, state.energy, state.name, next) })
  }

  const titleCount = countTitles(state.stack, state.energy)

  return (
    <div className="ctrl">
      {/* Mode */}
      <div className="ctrl__mode">
        <div className="segmented" role="radiogroup" aria-label="Who is this pass for">
          <button
            role="radio"
            className="segmented__item"
            aria-checked={!isSquad}
            aria-selected={!isSquad}
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'solo' })}
          >
            <Icon name="user" size="1em" />
            Just me
          </button>
          <button
            role="radio"
            className="segmented__item"
            aria-checked={isSquad}
            aria-selected={isSquad}
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'squad' })}
          >
            <Icon name="users" size="1em" />
            My squad
          </button>
        </div>
      </div>

      <Section
        n="01"
        title={isSquad ? 'The crew' : 'Your photo'}
        hint={
          isSquad
            ? 'Up to four builders in one frame. Any photo shape works.'
            : 'Portrait, landscape, off-centre — no cropping needed.'
        }
      >
        {isSquad ? <SquadBlock /> : <PhotoBlock />}
      </Section>

      <Section n="02" title={isSquad ? 'Crew details' : 'Your details'}>
        <div className="ctrl__fields">
          {isSquad ? (
            <label className="field">
              <div className="field__label">
                <span className="field__name">Team name</span>
                <span className="field__hint">{state.teamName.length}/22</span>
              </div>
              <input
                className="input"
                placeholder="e.g. Root Critics"
                value={state.teamName}
                maxLength={22}
                autoComplete="off"
                onChange={(e) => dispatch({ type: 'SET_TEAM_NAME', payload: e.target.value })}
              />
            </label>
          ) : (
            <label className="field">
              <div className="field__label">
                <span className="field__name">Name or handle</span>
                <span className="field__hint">{state.name.length}/22</span>
              </div>
              <input
                className="input"
                placeholder="e.g. Meera or @meerabuilds"
                value={state.name}
                maxLength={22}
                autoComplete="off"
                onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
              />
            </label>
          )}

          <div className="field">
            <div className="field__label">
              <span className="field__name">Stack</span>
            </div>
            <div className="chips" role="radiogroup" aria-label="Stack">
              {STACKS.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  className="chip"
                  aria-checked={state.stack === s.id}
                  onClick={() => dispatch({ type: 'SET_STACK', payload: s.id })}
                >
                  <span className="chip__dot" />
                  {s.label}
                </button>
              ))}
            </div>
            {state.stack === 'OTHER' && (
              <input
                className="input ctrl__custom"
                placeholder="Name your craft — e.g. Robotics, Games, Bio"
                value={state.customStack}
                maxLength={18}
                onChange={(e) => dispatch({ type: 'SET_CUSTOM_STACK', payload: e.target.value })}
                aria-label="Custom stack"
              />
            )}
          </div>
        </div>
      </Section>

      {!isSquad && (
        <Section n="03" title="Builder class" hint="Your energy picks the class. Reroll for a different read.">
          <div className="ctrl__fields">
            <div className="chips" role="radiogroup" aria-label="Builder energy">
              {ENERGIES.map((e) => (
                <button
                  key={e.id}
                  role="radio"
                  className="chip"
                  aria-checked={state.energy === e.id}
                  title={e.desc}
                  onClick={() => {
                    setTitleOffset(0)
                    dispatch({ type: 'SET_ENERGY', payload: e.id })
                  }}
                >
                  <span className="chip__dot" />
                  {e.label}
                </button>
              ))}
            </div>

            <div className="title-out">
              <div className="title-out__body">
                <p className="title-out__label mono">Your class</p>
                <p className="title-out__value">{state.builderTitle || 'Builder'}</p>
              </div>
              <button
                className="btn btn--outline btn--sm"
                onClick={reroll}
                disabled={titleCount < 2}
                title={titleCount < 2 ? 'Only one class for this combination' : 'Try another class'}
              >
                <Icon name="shuffle" size="1em" />
                Reroll
              </button>
            </div>
          </div>
        </Section>
      )}

      <Section
        n={isSquad ? '03' : '04'}
        title="Goa world"
        hint="Same brand, three moods. Changes the whole frame."
      >
        <div className="worlds" role="radiogroup" aria-label="Visual world">
          {STYLES.map((s) => (
            <button
              key={s.id}
              role="radio"
              className="world"
              aria-checked={state.style === s.id}
              style={{ '--world-a': s.accent, '--world-b': s.accentDark }}
              onClick={() => dispatch({ type: 'SET_STYLE', payload: s.id })}
            >
              <span className="world__swatch" aria-hidden="true" />
              <span className="world__text">
                <span className="world__name">{s.label}</span>
                <span className="world__tag">{s.tagline}</span>
              </span>
              <span className="world__check" aria-hidden="true">
                <Icon name="check" size="0.9em" strokeWidth={2.4} />
              </span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
