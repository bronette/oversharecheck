/** OverShare Check mark: a shield (security) + radar scan + red blip (exposure found). */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="osg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 26.5 6.3V14.5C26.5 21.4 21.8 25.5 16 27.5 10.2 25.5 5.5 21.4 5.5 14.5V6.3Z"
        fill="url(#osg)"
        fillOpacity="0.12"
        stroke="url(#osg)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14.5" r="6.4" stroke="url(#osg)" strokeWidth="1.1" opacity="0.35" />
      <circle cx="16" cy="14.5" r="3.4" stroke="url(#osg)" strokeWidth="1.1" opacity="0.6" />
      <line x1="16" y1="14.5" x2="20.6" y2="10.2" stroke="url(#osg)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20.6" cy="10.2" r="1.8" fill="#f43f5e" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-bold text-white ${className}`}>
      <LogoMark />
      <span>
        OverShare <span className="grad-text">Check</span>
      </span>
    </span>
  );
}
