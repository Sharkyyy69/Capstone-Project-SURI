import { CheckIcon, LeafIcon, ScanCorners, SuriLogo } from './AuthUI';

/* ---------- Left-hand hero illustration ---------- */

const floatingCards = [
  { icon: '🍊', className: 'right-[14%] top-[2%] rotate-[8deg]' },
  { icon: '🍌', className: 'right-[2%] top-[30%] -rotate-[6deg]' },
  { icon: '🥩', className: 'right-[6%] top-[58%] rotate-[6deg]' },
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px]">
      {/* sparkle accents */}
      <span className="absolute left-[38%] top-[4%] text-2xl text-[#7cb98f]" aria-hidden="true">✳</span>
      <span className="absolute left-[44%] top-[56%] text-xl text-[#9ccaa9]" aria-hidden="true">✳</span>

      {/* floating product cards */}
      {floatingCards.map((card) => (
        <div
          key={card.icon}
          className={`absolute flex h-24 w-24 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-5xl shadow-[0_14px_30px_rgba(40,80,55,0.14)] backdrop-blur sm:h-28 sm:w-28 sm:text-6xl ${card.className}`}
          aria-hidden="true"
        >
          <div className="absolute inset-2">
            <ScanCorners className="border-[#cfe3d4]" />
          </div>
          {card.icon}
        </div>
      ))}

      {/* phone */}
      <div className="absolute left-[30%] top-[10%] h-[330px] w-[175px] -rotate-[8deg] rounded-[2.2rem] bg-[#1f2a24] p-2 shadow-[0_25px_45px_rgba(20,40,28,0.3)] sm:h-[370px] sm:w-[195px]">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-[#f3f8f3] to-[#e3efe4]">
          <div className="mx-auto mt-2 h-4 w-16 rounded-full bg-[#1f2a24]" />
          <div className="relative mx-5 mt-10 flex flex-1 items-center justify-center">
            <ScanCorners className="border-[#3f9a6a]" />
            <span className="text-7xl" aria-hidden="true">🥩</span>
          </div>
          <div className="mx-auto my-4 flex items-center gap-2 rounded-full bg-[#3f9a6a] px-4 py-1.5 text-sm font-semibold text-white shadow-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#3f9a6a]">
              <CheckIcon className="h-3 w-3" />
            </span>
            Fresh
          </div>
          <div className="flex items-center justify-around border-t border-[#d7e4d9] bg-white/70 py-2 text-[#6d8a77]">
            <span className="text-sm" aria-hidden="true">⌂</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3f9a6a] text-xs">◎</span>
            <span className="text-sm" aria-hidden="true">▤</span>
          </div>
        </div>
      </div>

      {/* produce pile in the foreground */}
      <div className="absolute -bottom-2 left-0 flex items-end text-[4.5rem] leading-none drop-shadow-lg sm:text-[5.5rem]" aria-hidden="true">
        <LeafIcon className="-mr-6 mb-10 h-16 w-16 -rotate-12 text-[#4f9b5f]" />
        <span className="-mr-4">🍊</span>
        <span className="-mr-3 mb-6">🍌</span>
        <span className="-mr-2">🍊</span>
        <span>🥩</span>
      </div>
      <div className="absolute bottom-0 left-2 text-3xl" aria-hidden="true">🫐🫐</div>
    </div>
  );
}

/*
 * Two-column auth layout: hero illustration on the left, white card on the
 * right. Used by the login and registration pages. On phones the illustration
 * is hidden so the form stays near the top of the screen.
 */
export default function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#1d2b22]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- Left: hero ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f4f9f3] via-[#eef6ee] to-[#e2efe1] px-6 pb-10 pt-10 sm:pb-6 sm:px-12 lg:px-14 lg:pt-14">
          {/* soft organic background shapes */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/60" />
          <div className="pointer-events-none absolute -left-20 bottom-24 h-72 w-72 rounded-full bg-[#d9ebd8]/70" />
          <LeafIcon className="pointer-events-none absolute right-[8%] top-[6%] h-8 w-8 rotate-45 text-[#8cc49a]/70" />

          <div className="relative z-10 flex h-full flex-col">
            <h1 className="text-[2.6rem] font-black leading-[1.02] tracking-tight sm:text-6xl">
              See
              <br />
              Freshness.
              <br />
              <span className="text-[#2f8a57]">Choose Better.</span>
            </h1>
            <p className="mt-4 max-w-xs text-lg font-medium leading-snug text-[#3d4f43]">
              AI-powered freshness check for fruits and meat.
            </p>
            <div className="mt-5 h-1.5 w-16 rounded-full bg-[#3f9a6a]" />

            <div className="mt-6 hidden flex-1 sm:block lg:mt-2">
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* ---------- Right: form card ---------- */}
        <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#eef6ee]" />
          <div className="pointer-events-none absolute -left-24 bottom-[-60px] h-64 w-64 rounded-full border border-[#e5efe5]" />
          <LeafIcon className="pointer-events-none absolute right-[10%] top-[30%] h-7 w-7 -rotate-12 text-[#b9dcc1]" />
          <div
            className="pointer-events-none absolute bottom-10 right-10 grid grid-cols-3 gap-2"
            aria-hidden="true"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#cfe3d4]" />
            ))}
          </div>

          <div className="relative w-full max-w-[420px] rounded-3xl border border-[#edf0ec] bg-white p-7 shadow-[0_20px_50px_rgba(30,60,40,0.08)] sm:p-9">
            <SuriLogo />
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
