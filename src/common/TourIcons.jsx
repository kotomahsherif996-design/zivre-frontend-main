import React from 'react'

/**
 * A compact, hand-built line-icon set in a single consistent style
 * (rounded stroke, 24x24 grid) so the guided tour and payment UI
 * share one visual language instead of mixing default Material icons
 * with emoji.
 */
const PATHS = {
  sparkles: (
    <>
      <path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8L12 3z" />
      <circle cx="4.6" cy="18.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.2" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </>
  ),
  flow: (
    <>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <path d="M5 8.2v3a4 4 0 004 4h1" />
      <path d="M19 8.2v3a4 4 0 01-4 4h-1" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 13h18" />
      <path d="M12 9v12" />
      <path d="M12 9C10.3 5.2 6 5.4 6 7.8S9 9 12 9z" />
      <path d="M12 9c1.7-3.8 6-3.6 6-1.2S15 9 12 9z" />
    </>
  ),
  chat: (
    <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.2 0-2.4-.2-3.5-.7L3 21l1.8-5.4A8.5 8.5 0 1121 11.5z" />
  ),
  toolbox: (
    <>
      <rect x="2.5" y="8.5" width="19" height="11.5" rx="1.6" />
      <path d="M8 8.5V6.8a2 2 0 012-2h4a2 2 0 012 2v1.7" />
      <path d="M2.5 13.5h19" />
      <path d="M10.3 13.5v1.6h3.4v-1.6" />
    </>
  ),
  headset: (
    <>
      <path d="M4.5 13.5v-1.2a7.5 7.5 0 0115 0v1.2" />
      <rect x="2.7" y="13.5" width="4" height="6" rx="1.5" />
      <rect x="17.3" y="13.5" width="4" height="6" rx="1.5" />
      <path d="M19.5 19.5a3.8 3.8 0 01-3.8 3.8h-1.9" />
    </>
  ),
  bars: (
    <>
      <path d="M4.5 20V11" />
      <path d="M12 20V4" />
      <path d="M19.5 20v-6.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8.3a6 6 0 0112 0c0 4 1.4 5.4 2 6.4H4c.6-1 2-2.4 2-6.4z" />
      <path d="M10 19.2a2 2 0 004 0" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.2" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="17.2" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l2.4 12.2h9.9L19.5 7H6.2" />
    </>
  ),
  wand: (
    <>
      <path d="M4 20L15 9" />
      <path d="M14 4l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9L11.2 6.8l1.9-.9z" />
      <path d="M18.3 12.2l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0113 0c0 5.3-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  wallet: (
    <>
      <rect x="2.5" y="6" width="19" height="14" rx="2" />
      <path d="M2.5 10.2h19" />
      <circle cx="17" cy="14.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  route: (
    <>
      <circle cx="5" cy="6" r="2.1" />
      <circle cx="19" cy="18" r="2.1" />
      <path d="M5 8.1v2.4a4 4 0 004 4h2a4 4 0 014 4" />
    </>
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16 9.2" />
    </>
  ),
  star: (
    <path d="M12 3.4l2.6 5.5 5.9.7-4.3 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.3-4.1 5.9-.7z" />
  ),
  repeat: (
    <>
      <path d="M4.2 7.5h12.3a3 3 0 013 3v1" />
      <path d="M9 3.3L4.2 7.5 9 11.5" />
      <path d="M19.8 16.5H7.5a3 3 0 01-3-3v-1" />
      <path d="M15 20.7l4.8-4.2-4.8-4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 5-3.5 7.7-7 9-3.5-1.3-7-4-7-9V6z" />
      <path d="M9 12.2l2.1 2.1L15.5 10" />
    </>
  ),
  search: (
    <>
      <circle cx="10.6" cy="10.6" r="6.6" />
      <path d="M20 20l-4.9-4.9" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.4" width="6" height="3.2" rx="1.1" />
      <path d="M8.5 11.2h7M8.5 15.2h7" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11A8 8 0 106.3 17.3" />
      <path d="M20 5v6h-6" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  puzzle: (
    <path d="M6 4.5h5v1.9a2 2 0 104 0V4.5h5v5h-1.9a2 2 0 100 4H20v5h-5v-1.9a2 2 0 10-4 0V19H6v-5H4.1a2 2 0 100-4H6z" />
  ),
  percent: (
    <>
      <circle cx="6.7" cy="6.7" r="2.4" />
      <circle cx="17.3" cy="17.3" r="2.4" />
      <path d="M5 19L19 5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.2 20c0-3.3 2.6-6 5.8-6s5.8 2.7 5.8 6" />
      <circle cx="17.2" cy="9" r="2.3" />
      <path d="M15.8 14.1a4.8 4.8 0 014.3 4.8" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="9.2" cy="8" r="3.2" />
      <path d="M3.2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 12.2l1.9 1.9 3.3-3.4" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12.2h5M9.5 16.2h5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  tree: (
    <>
      <circle cx="12" cy="4.2" r="1.9" />
      <circle cx="5" cy="19" r="1.9" />
      <circle cx="19" cy="19" r="1.9" />
      <path d="M12 6.1v4.9M12 11L5 17M12 11l7 6" />
    </>
  ),
  crown: (
    <>
      <path d="M3 8l4 3 5-6 5 6 4-3-2 10.5H5z" />
      <path d="M5 21h14" />
    </>
  ),
  phone: (
    <path d="M6.6 2.5h3l1.4 4.6-2.3 1.8a13 13 0 006.4 6.4l1.8-2.3 4.6 1.4v3a2 2 0 01-2.2 2A17.5 17.5 0 014.6 4.7a2 2 0 012-2.2z" />
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6.5 6.5 0 00-3.6 11.9c.6.4 1 1.1 1 1.9v.4h5.2v-.4c0-.8.4-1.5 1-1.9A6.5 6.5 0 0012 3z" />
    </>
  )
}

export const TourIcon = ({ name, size = 26, strokeWidth = 1.8, color = 'currentColor', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    {PATHS[name] || PATHS.sparkles}
  </svg>
)

export default TourIcon
