'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] grid place-items-center bg-black text-white px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-black">Skill Swap could not load.</h1>
          <p className="mt-3 text-sm text-white/70">{error.message || 'A fatal application error occurred.'}</p>
          <button onClick={reset} className="mt-6 min-h-11 px-4 rounded-[9px] bg-[#f5dc18] text-black text-xs font-bold">
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
