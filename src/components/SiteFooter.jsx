import React from 'react'
import Icon, { Wordmark, BrandMarks, XLogo } from './ui/Icon'

export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap wrap--wide">
        <div className="foot__inner">
          <div className="foot__brand-col">
            <Wordmark />
            <p className="foot__blurb">
              An unofficial builder-pass generator for Hacker House Goa 2026. Drop a photo, get a
              frame, post it with #FrameInGoa. Your original photo never leaves your device.
            </p>
            <BrandMarks className="text-sun" size={14} />
          </div>

          <div>
            <h3 className="foot__col-title">The event</h3>
            <ul className="foot__list">
              <li>
                <a href="https://hhgoa.com" target="_blank" rel="noopener noreferrer">
                  hhgoa.com
                  <Icon name="external" size="0.9em" />
                </a>
              </li>
              <li>
                <span>
                  <Icon name="pin" size="0.9em" /> Goa, India
                </span>
              </li>
              <li>
                <span>
                  <Icon name="clock" size="0.9em" /> 28 — 31 Oct 2026
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="foot__col-title">Share</h3>
            <ul className="foot__list">
              <li>
                <a
                  href="https://x.com/search?q=%23FrameInGoa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XLogo size="0.85em" /> #FrameInGoa
                </a>
              </li>
              <li>
                <span>
                  <Icon name="lock" size="0.9em" /> Processed on device
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot__bar">
          <span>© 2026 · Built for the HH Goa shortlisting task</span>
          <span>15.4909° N, 73.8278° E</span>
        </div>
      </div>
    </footer>
  )
}
