'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">Something went wrong</p>
        <h1 className="mt-3 text-3xl">The workspace hit an error.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="ss-button-primary mt-6">Try again</button>
      </div>
    </div>
  );
}
