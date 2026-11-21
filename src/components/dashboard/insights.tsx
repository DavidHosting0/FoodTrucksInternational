export function InsightsList({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold tracking-tight">Hinweise</h2>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li
            key={insight}
            className="metal-surface rounded-3xl px-4 py-3.5 text-sm leading-relaxed text-muted-foreground"
            style={{ animationDelay: `${160 + index * 40}ms` }}
          >
            <span className="text-foreground">{insight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
