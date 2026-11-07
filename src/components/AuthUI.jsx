/* Shared icons, branding and styles for the auth pages (no extra dependencies). */

export const MIN_PASSWORD_LENGTH = 8;

export const fieldClass =
  'flex items-center gap-3 rounded-xl border border-[#e6e9e4] bg-[#f6f7f4] px-4 py-3.5 text-[#66736a] transition focus-within:border-[#7fb894] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7fb894]/15';
export const inputClass =
  'w-full border-0 bg-transparent text-base text-[#1d2b22] placeholder:text-[#66736a] focus:outline-none';
export const primaryButtonClass =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f7d52] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,154,106,0.25)] transition hover:bg-[#256743] disabled:cursor-not-allowed disabled:opacity-70';
export const linkClass = 'font-semibold text-[#24724a] hover:text-[#1b5838]';

export function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function EyeIcon({ off, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function LeafIcon(props) {
  return (
    <svg viewBox="0 0 40 40" {...props}>
      <path d="M4 36C4 16 16 4 36 4c0 20-12 32-32 32Z" fill="currentColor" />
      <path d="M6 34 30 10" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
    </svg>
  );
}

/* Scanner-frame corners used on the logo, phone screen and product cards */
export function ScanCorners({ className = 'border-[#3f9a6a]' }) {
  const base = `absolute h-4 w-4 ${className}`;
  return (
    <>
      <span className={`${base} left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]`} />
      <span className={`${base} right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]`} />
      <span className={`${base} bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]`} />
    </>
  );
}

export function SuriLogo() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <ScanCorners className="border-[#2f8a57]" />
        <span className="text-2xl leading-none" aria-hidden="true">🍅</span>
      </div>
      <span className="mt-1 text-2xl font-extrabold tracking-tight text-[#24724a]">SURI</span>
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#4c5b51]">
        AI Freshness Assessment
      </span>
    </div>
  );
}


export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function KeyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l3 3M14 9l2 2" />
    </svg>
  );
}

/* Centered white card on a soft green background, used by the password reset page. */
export function AuthCardLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4f9f3] via-white to-[#eef6ee] px-5 py-12 text-[#1d2b22]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e4f0e3]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border border-[#dceadc]" />
      <LeafIcon className="pointer-events-none absolute right-[12%] top-[22%] h-7 w-7 -rotate-12 text-[#b9dcc1]" />

      <div className="relative w-full max-w-[420px] rounded-3xl border border-[#edf0ec] bg-white p-7 shadow-[0_20px_50px_rgba(30,60,40,0.08)] sm:p-9">
        <SuriLogo />
        {children}
      </div>
    </div>
  );
}
