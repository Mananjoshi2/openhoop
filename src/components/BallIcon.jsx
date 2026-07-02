export default function BallIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v18" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 8c3 1.5 12 1.5 15 0" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 16c3-1.5 12-1.5 15 0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
