export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.35_0.08_145_/_0.35),_transparent_55%),radial-gradient(ellipse_at_bottom,_oklch(0.25_0.04_250_/_0.4),_transparent_50%)]" />
      <div className="relative z-10 mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Finance Tracker
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Personal Expense Manager
        </h1>
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
