"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardMetrics } from "@/lib/analytics/dashboard";
import { monthComparisonData } from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function moneyTick(currency: string) {
  return (value: number) =>
    new Intl.NumberFormat("de-CH", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value) + ` ${currency}`;
}

export function DashboardCharts({ metrics }: { metrics: DashboardMetrics }) {
  const comparison = monthComparisonData(metrics);
  const hasData = metrics.transactionCount > 0 || metrics.previousTotal > 0;

  if (!hasData && metrics.monthlyTrend.every((m) => m.total === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualisierungen</CardTitle>
          <CardDescription>
            Sobald Ausgaben erfasst sind, erscheinen hier Diagramme.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Ausgabenentwicklung</CardTitle>
          <CardDescription>Letzte 12 Monate</CardDescription>
        </CardHeader>
        <CardContent className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.monthlyTrend}>
              <defs>
                <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={moneyTick(metrics.currency)} width={70} />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value ?? 0), metrics.currency)
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                fill="url(#spend)"
                name="Ausgaben"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategorien</CardTitle>
          <CardDescription>Dieser Monat</CardDescription>
        </CardHeader>
        <CardContent className="h-56 sm:h-64">
          {metrics.byCategory.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byCategory}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {metrics.byCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    formatMoney(Number(value ?? 0), metrics.currency)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Händler</CardTitle>
          <CardDescription>Dieser Monat</CardDescription>
        </CardHeader>
        <CardContent className="h-56 sm:h-64">
          {metrics.byMerchant.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byMerchant} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis type="number" tickFormatter={moneyTick(metrics.currency)} hide />
                <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) =>
                    formatMoney(Number(value ?? 0), metrics.currency)
                  }
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[0, 6, 6, 0]} name="Betrag" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monat vs. Vormonat</CardTitle>
          <CardDescription>Vergleich</CardDescription>
        </CardHeader>
        <CardContent className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={moneyTick(metrics.currency)} width={70} />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value ?? 0), metrics.currency)
                }
              />
              <Bar dataKey="total" fill="var(--chart-2)" radius={[6, 6, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vermeidbar</CardTitle>
          <CardDescription>Optional / unnötig</CardDescription>
        </CardHeader>
        <CardContent className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.avoidableTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={moneyTick(metrics.currency)} width={56} />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value ?? 0), metrics.currency)
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                fill="color-mix(in oklch, var(--primary) 25%, transparent)"
                name="Vermeidbar"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Keine Daten für diesen Monat
    </div>
  );
}
