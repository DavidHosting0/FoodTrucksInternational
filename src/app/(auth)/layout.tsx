export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="relative z-10 mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">E</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Expense
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deine Finanzen. Klar. Grün.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
