import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.17em] text-muted-foreground font-bold">404</p>
        <h1 className="mt-3 text-3xl">This page is not here.</h1>
        <p className="mt-3 text-sm text-muted-foreground">The route does not exist in Skill Swap.</p>
        <Link href="/" className="ss-button-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
