interface CopahomeMarkProps {
  className?: string;
}

/**
 * The circular "shutter/slats" mark from the Copahome brand system (seen on
 * the launch invite and fabric swatch tag) — a literal nod to window
 * treatments, recreated as inline SVG so it scales cleanly at any size and
 * inherits currentColor.
 */
export function CopahomeMark({ className }: CopahomeMarkProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.1">
      <circle cx="20" cy="20" r="15.25" />
      <g clipPath="url(#copahome-mark-clip)">
        <line x1="3" y1="11.5" x2="37" y2="11.5" />
        <line x1="3" y1="17.5" x2="37" y2="17.5" />
        <line x1="3" y1="23.5" x2="37" y2="23.5" />
        <line x1="3" y1="29.5" x2="37" y2="29.5" />
      </g>
      <defs>
        <clipPath id="copahome-mark-clip">
          <circle cx="20" cy="20" r="15.25" />
        </clipPath>
      </defs>
    </svg>
  );
}
