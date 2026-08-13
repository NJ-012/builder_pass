import React, { useCallback, useMemo } from 'react'
import { useIdentity } from '../context/IdentityContext'
import { useToast } from './ui/Toast'
import Icon, { BrandMarks, XLogo } from './ui/Icon'
import UploadPad from './studio/UploadPad'
import SampleCard from './SampleCard'
import { FORMATS } from '../lib/cardRenderer'
import './Landing.css'

const HERO_SAMPLES = [
  {
    key: 'afterdark',
    format: FORMATS.BUILDER_ID,
    identity: {
      name: 'Meera',
      stack: 'AI',
      energy: 'ARCHITECT',
      style: 'afterdark',
      builderTitle: 'Neural Architect',
      builderId: 'BUILDER // 0247',
    },
  },
  {
    key: 'goan',
    format: FORMATS.BUILDER_ID,
    identity: {
      name: 'Rohan',
      stack: 'CRYPTO',
      energy: 'DEGEN',
      style: 'goan',
      builderTitle: 'Protocol Degen',
      builderId: 'BUILDER // 1109',
    },
  },
  {
    key: 'degen',
    format: FORMATS.BUILDER_ID,
    identity: {
      name: 'Aisha',
      stack: 'DESIGN',
      energy: 'VISIONARY',
      style: 'degen',
      builderTitle: 'Interface Visionary',
      builderId: 'BUILDER // 0731',
    },
  },
]

const STEPS = [
  {
    n: '01',
    icon: 'upload',
    title: 'Drop any photo',
    body: 'Portrait, landscape, off-centre, HEIC straight from an iPhone. We straighten it, size it down and centre it for you — cropping first is not your job.',
  },
  {
    n: '02',
    icon: 'sparkle',
    title: 'Make it yours',
    body: 'Add a name and a stack. A builder class is generated to match, and three Goa worlds change the whole mood of the frame. Everything previews live.',
  },
  {
    n: '03',
    icon: 'share',
    title: 'Download and post',
    body: 'Save a 2160px PNG, or hit Share to X — the caption and #FrameInGoa are already written, and the link preview carries your graphic.',
  },
]

const FORMAT_CARDS = [
  {
    key: 'card',
    format: FORMATS.BUILDER_ID,
    name: 'Builder ID',
    dims: '1080 × 1350',
    body: 'An event badge built for the timeline — your portrait, your builder class, a serial that is yours alone.',
    identity: {
      name: 'Kabir',
      stack: 'WEB',
      energy: 'MAKER',
      style: 'goan',
      builderTitle: 'Full-Stack Shipwright',
      builderId: 'BUILDER // 0412',
    },
  },
  {
    key: 'pfp',
    format: FORMATS.PFP,
    name: 'PFP Frame',
    dims: '1080 × 1080',
    body: 'A circular Goa frame that wraps your photo instead of covering it. Drop it straight into your avatar slot.',
    identity: {
      name: 'Nila',
      stack: 'ML',
      energy: 'RESEARCHER',
      style: 'afterdark',
      builderTitle: 'ML Research Scientist',
      builderId: 'BUILDER // 0908',
    },
  },
  {
    key: 'share',
    format: FORMATS.SHARE_CARD,
    name: 'Share Card',
    dims: '1200 × 630',
    body: 'The wide crop, tuned for link previews so a shared URL never renders as a blank thumbnail.',
    identity: {
      name: 'Devan',
      stack: 'CYBER',
      energy: 'HACKER',
      style: 'degen',
      builderTitle: 'Red Team Lead',
      builderId: 'BUILDER // 1337',
    },
  },
  {
    key: 'squad',
    format: FORMATS.SQUAD,
    name: 'Squad Pass',
    dims: '1080 × 1350',
    tag: 'For teams',
    body: 'Up to four teammates in a single frame — one shared pass for the whole crew, not four separate posts.',
    identity: {
      teamName: 'Root Critics',
      stack: 'AI',
      energy: 'CHAOS_ENGINEER',
      style: 'goan',
      builderId: 'BUILDER // 0044',
      squad: [],
    },
  },
]

const PROOF = [
  { icon: 'bolt', title: 'Seconds, not spinners', body: 'Every render happens on your device, live, as you type.' },
  { icon: 'crop', title: 'No cropping required', body: 'Any aspect ratio lands in frame. Nudge it only if you want to.' },
  { icon: 'lock', title: 'Your photo stays put', body: 'Nothing is uploaded unless you choose to share a link.' },
  { icon: 'image', title: 'A real image file', body: 'A 2160px PNG you can download, print or attach anywhere.' },
  { icon: 'users', title: 'Bring the whole team', body: 'Squad Pass puts up to four builders in one shared frame.' },
  { icon: 'user', title: 'No signup wall', body: 'No account, no email, no gate before you see the result.' },
]

const FAQ = [
  {
    q: 'Do I need to crop my photo first?',
    a: 'No. Drop in whatever your camera roll gives you. The frame fits portrait, landscape and square automatically, and biases the crop towards faces. If you want it positioned differently, drag the photo inside the preview.',
  },
  {
    q: 'Does it work with iPhone photos?',
    a: 'Yes. HEIC and HEIF files are converted in the browser, and EXIF rotation is applied so photos never come out sideways. JPG, PNG, WEBP and AVIF work too.',
  },
  {
    q: 'Where do my photos go?',
    a: 'Nowhere. Reading, framing and exporting all happen in your browser. The only time anything leaves your device is if you use Share to X and the link route is used — and then it is the finished graphic that is uploaded, never your original.',
  },
  {
    q: 'What should I post?',
    a: 'Share to X opens a composer with the caption and #FrameInGoa already written. On phones the image is attached directly through the native share sheet; on desktop the PNG downloads and a link with the right preview image is prepared.',
  },
  {
    q: 'Can my team share one frame?',
    a: 'Yes — switch the studio to Squad and add up to four teammates. Everyone lands in one pass with a shared crew serial.',
  },
]

export default function Landing() {
  const { dispatch, setView } = useIdentity()
  const { toast } = useToast()

  const handlePick = useCallback(
    ({ file, dataUrl, width, height, aspect }) => {
      dispatch({
        type: 'SET_PHOTO',
        payload: { file, dataUrl, meta: { width, height, aspect } },
      })
      setView('studio')
      toast({ tone: 'ok', title: 'Photo loaded', desc: 'Your pass is rendering below.' })
    },
    [dispatch, setView, toast]
  )

  const heroSamples = useMemo(() => HERO_SAMPLES, [])

  return (
    <div className="landing">
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="wrap wrap--wide hero__inner">
          <div className="hero__copy">
            <p className="badge badge--outline-sun hero__badge anim-rise">
              <span className="badge__dot badge__dot--live" />
              Goa, India · 28 — 31 Oct 2026
            </p>

            <h1 className="hero__title display display--tight anim-rise" style={{ animationDelay: '60ms' }}>
              One photo.
              <br />
              One frame.
              <br />
              <span className="text-sun">Ten seconds.</span>
            </h1>

            <p className="lead hero__lead anim-rise" style={{ animationDelay: '120ms' }}>
              Drop any photo and walk away with an unmistakably Hacker House Goa 2026 builder pass,
              PFP frame and share card. No signup, no cropping, no loading screen.
            </p>

            <div className="hero__pad anim-rise" style={{ animationDelay: '180ms' }}>
              <UploadPad
                onPick={handlePick}
                listenForPaste
                title="Drop a photo, or tap to choose one"
                hint="JPG · PNG · WEBP · HEIC — any shape, straight from your phone"
              />
            </div>

            <div className="hero__row anim-rise" style={{ animationDelay: '240ms' }}>
              <button className="btn btn--outline" onClick={() => setView('studio')}>
                Look around the studio first
                <Icon name="arrowRight" size="1em" className="btn__icon" />
              </button>
              <span className="hero__hash">
                <XLogo size="0.9em" /> Post it with <b>#FrameInGoa</b>
              </span>
            </div>
          </div>

          <div className="hero__stage" aria-hidden="false">
            <div className="hero__fan">
              {heroSamples.map((s, i) => (
                <div key={s.key} className={`hero__fan-item hero__fan-item--${i}`}>
                  <SampleCard
                    identity={s.identity}
                    format={s.format}
                    scale={0.34}
                    alt={`Example builder pass in the ${s.identity.style} world`}
                  />
                </div>
              ))}
            </div>
            <p className="hero__stage-note mono">Three worlds · One identity system</p>
          </div>
        </div>
      </section>

      {/* ── TAPE ───────────────────────────────────────────────────────── */}
      <div className="tape tape--sun" aria-hidden="true">
        <div className="tape__track">
          {[0, 1].map((g) => (
            <div className="tape__group" key={g}>
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <span>#FrameInGoa</span>
                  <span>✳</span>
                  <span>Upload → Frame → Post</span>
                  <span>✳</span>
                  <span>Hacker House Goa 2026</span>
                  <span>✳</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="section" id="how">
        <div className="wrap wrap--wide">
          <header className="section__head">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title">
              Three moves from camera roll<br />
              to <span className="text-sun">timeline</span>
            </h2>
          </header>

          <ol className="steps">
            {STEPS.map((s) => (
              <li className="step-card" key={s.n}>
                <div className="step-card__top">
                  <span className="step-card__n mono">{s.n}</span>
                  <span className="step-card__icon">
                    <Icon name={s.icon} size="1.15em" />
                  </span>
                </div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FORMATS ────────────────────────────────────────────────────── */}
      <section className="section section--sunk" id="formats">
        <div className="wrap wrap--wide">
          <header className="section__head section__head--split">
            <div>
              <p className="eyebrow">What you get</p>
              <h2 className="section-title">
                Four outputs.<br />
                One <span className="text-sun">identity</span>.
              </h2>
            </div>
            <p className="section__lede lead">
              Every format is generated from the same seed, so your pass, your avatar and your link
              preview all read as the same person at the same event.
            </p>
          </header>

          <div className="formats">
            {FORMAT_CARDS.map((f) => (
              <article className="format" key={f.key}>
                <div className="format__frame">
                  <SampleCard
                    identity={f.identity}
                    format={f.format}
                    scale={f.key === 'share' ? 0.34 : 0.3}
                    alt={`${f.name} example`}
                  />
                </div>
                <div className="format__meta">
                  <div className="format__head">
                    <h3 className="format__name">{f.name}</h3>
                    {f.tag && <span className="badge badge--pink">{f.tag}</span>}
                  </div>
                  <p className="format__dims mono">{f.dims} PNG</p>
                  <p className="format__body">{f.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ──────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap wrap--wide">
          <header className="section__head">
            <p className="eyebrow">Built to the brief</p>
            <h2 className="section-title">Nothing between you and the result</h2>
          </header>

          <ul className="proof">
            {PROOF.map((p) => (
              <li className="proof__item" key={p.title}>
                <span className="proof__icon">
                  <Icon name={p.icon} size="1.05em" />
                </span>
                <div>
                  <h3 className="proof__title">{p.title}</h3>
                  <p className="proof__body">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="section section--sunk" id="faq">
        <div className="wrap wrap--wide">
          <header className="section__head">
            <p className="eyebrow">Questions</p>
            <h2 className="section-title">Before you drop the photo</h2>
          </header>

          <div className="faq">
            {FAQ.map((item) => (
              <details className="faq__item" key={item.q}>
                <summary className="faq__q">
                  <span>{item.q}</span>
                  <span className="faq__mark" aria-hidden="true">
                    <Icon name="plus" size="1.05em" />
                  </span>
                </summary>
                <div className="faq__a">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="wrap wrap--narrow cta__inner">
          <BrandMarks className="text-sun" size={16} />
          <h2 className="cta__title display display--tight">
            The frame is ready.<br />
            <span className="text-sun">Bring a face.</span>
          </h2>
          <p className="lead cta__lead">
            Ten seconds from here to a post. No account, no gate, no waiting on a render queue.
          </p>
          <button className="btn btn--primary btn--lg" onClick={() => setView('studio')}>
            Open the studio
            <Icon name="arrowRight" size="1.05em" className="btn__icon" />
          </button>
        </div>
      </section>
    </div>
  )
}
