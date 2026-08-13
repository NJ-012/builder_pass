import React from 'react'

/**
 * Single-source icon set. Stroke icons inherit `currentColor` and scale with
 * font-size by default so they optically match the text they sit beside.
 */

const PATHS = {
  upload: (
    <>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 4.2-4.2a2 2 0 0 1 2.7-.1L15 16m0 0 2-1.8a2 2 0 0 1 2.6 0L20 15" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12m0 0 4.5-4.5M12 16l-4.5-4.5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.3v.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.7v.2" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15m0 0-6-6m6 6-6 6" />,
  arrowLeft: <path d="M19.5 12h-15m0 0 6-6m-6 6 6 6" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  shuffle: (
    <>
      <path d="M17 4.5 20.5 8 17 11.5M17 12.5l3.5 3.5L17 19.5" />
      <path d="M3.5 8h3.2a4 4 0 0 1 3.3 1.8l3 4.4a4 4 0 0 0 3.3 1.8h4.2" />
      <path d="M3.5 16h3.2a4 4 0 0 0 3.3-1.8l.6-.9M20.5 8h-4.2a4 4 0 0 0-3.3 1.8l-.6.9" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 4v4.5H16" />
    </>
  ),
  sparkle: (
    <path d="M12 3.5 13.9 9 19.5 11l-5.6 2L12 18.5 10.1 13 4.5 11 10.1 9 12 3.5Z" />
  ),
  zoom: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8 20.5 20.5M8.6 11h4.8M11 8.6v4.8" />
    </>
  ),
  expand: <path d="M9 4.5H4.5V9M15 4.5h4.5V9M15 19.5h4.5V15M9 19.5H4.5V15" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  bolt: <path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.5h-5.3L13.5 3Z" />,
  layers: (
    <>
      <path d="m12 3.5 8.5 4.3-8.5 4.3-8.5-4.3L12 3.5Z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3M3.5 16.4l8.5 4.3 8.5-4.3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.8-1.7h1.3a4.6 4.6 0 0 0 4.6-4.6c0-3.7-3.8-6.6-8.5-6.6Z" />
      <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="10" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8.8A2 2 0 0 1 5.5 7h1.8l1.2-2h6.9l1.2 2h1.9a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V8.8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.8 1.8 0 0 0 1.8 1.7h5.6a1.8 1.8 0 0 0 1.8-1.7l.9-12.5" />
    </>
  ),
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.5v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  drag: (
    <>
      <path d="M12 3.5v17M3.5 12h17" />
      <path d="m8.5 7.5 3.5-4 3.5 4M8.5 16.5l3.5 4 3.5-4M7.5 8.5l-4 3.5 4 3.5M16.5 8.5l4 3.5-4 3.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.4" />
      <path d="M3.2 19.5a6.4 6.4 0 0 1 12.6 0" />
      <path d="M16.2 5.6a3.4 3.4 0 0 1 0 5.8M17.5 14.3a6.4 6.4 0 0 1 3.3 5.2" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </>
  ),
  share: (
    <>
      <path d="M12 15.5V4m0 0L8 8m4-4 4 4" />
      <path d="M4.5 13.5v4.8a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4.8" />
    </>
  ),
  star: (
    <path d="M12 3.2 14.4 9l6.3.5-4.8 4.1 1.5 6.2L12 16.5 6.6 19.8l1.5-6.2L3.3 9.5 9.6 9 12 3.2Z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />,
  crop: (
    <>
      <path d="M6.5 2.5v15h15" />
      <path d="M2.5 6.5h15v15" />
    </>
  ),
}

export default function Icon({ name, size = '1em', strokeWidth = 1.75, className = '', ...rest }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {d}
    </svg>
  )
}

/** The X (formerly Twitter) glyph — solid, so it lives outside the stroke set. */
export function XLogo({ size = '1em', className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.03l-4.72-6.17L5.6 21H2.57l7.05-8.06L2.25 3h6.18l4.27 5.64L17.53 3Zm-1.06 16.14h1.67L7.6 4.74H5.81l10.66 14.4Z" />
    </svg>
  )
}

/**
 * The HH Goa lockup. Two stacked display lines with "Goa" carrying the sun
 * accent, matching how the event sets its own name.
 */
export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__line">Hacker House</span>
      <span className="wordmark__line wordmark__line--accent">Goa ’26</span>
    </span>
  )
}

/** The event's geometric marks — square, disc, eight-point star, sparkle. */
export function BrandMarks({ className = '', size = 18 }) {
  return (
    <span className={`brand-marks ${className}`} aria-hidden="true">
      <svg width={size * 4.6} height={size} viewBox="0 0 92 20" fill="currentColor">
        <rect x="0" y="1" width="18" height="18" />
        <circle cx="33" cy="10" r="9" />
        <path d="M56 0l2.4 7.6L66 10l-7.6 2.4L56 20l-2.4-7.6L46 10l7.6-2.4z" />
        <path d="M82 0c0 5.5 4.5 10 10 10-5.5 0-10 4.5-10 10 0-5.5-4.5-10-10-10 5.5 0 10-4.5 10-10z" />
      </svg>
    </span>
  )
}
