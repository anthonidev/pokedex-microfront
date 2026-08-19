/** Plain-SVG pokéball, matching `public/favicon.svg` — no icon-library dependency for it. */
export default function PokeballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="#fff" />
      <path d="M6 50a44 44 0 0 1 88 0Z" fill="#ee2a2a" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a1a" strokeWidth="5" />
      <rect x="6" y="47" width="88" height="6" fill="#1a1a1a" />
      <circle cx="50" cy="50" r="15" fill="#1a1a1a" />
      <circle cx="50" cy="50" r="10" fill="#fff" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="#1a1a1a" strokeWidth="4" />
    </svg>
  );
}
