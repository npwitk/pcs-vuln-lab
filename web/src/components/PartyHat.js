import React from 'react';

// A little striped party hat for Peanut's birthday: on the navbar logo, and on
// the peanut dancing on the cake. Sized and placed by whoever wears it.
let clipCount = 0;

export default function PartyHat({ className, style }) {
  // A unique clip id per hat, so two on one page don't share (or lose) it.
  const [clipId] = React.useState(() => `party-hat-${++clipCount}`);
  return (
    <svg className={className} style={style} viewBox="0 0 17 20" aria-hidden="true">
      <defs>
        <clipPath id={clipId}><path d="M8.5 3 L15.5 19 H1.5 Z" /></clipPath>
      </defs>
      <path d="M8.5 3 L15.5 19 H1.5 Z" fill="#5E5CE6" />
      <g clipPath={`url(#${clipId})`}>
        <path d="M0 9 L17 13 V15.5 L0 11.5 Z" fill="#FF6B9A" />
        <path d="M0 15 L17 19 V21 L0 17 Z" fill="#30D158" />
      </g>
      <circle cx="8.5" cy="3" r="2.6" fill="#FFD60A" />
    </svg>
  );
}
