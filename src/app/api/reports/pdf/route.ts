import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { auth } from "@/auth";
import { computeDashboardMetrics } from "@/lib/analytics/dashboard";
import { getTransactions } from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";
import { formatMoney } from "@/lib/format";

export async function GET() {
  if (!isDemoMode()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const transactions = await getTransactions();
  const metrics = computeDashboardMetrics(transactions);
  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy", { locale: de });

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Monatsreport", { align: "left" });
    doc.fontSize(12).fillColor("#555").text(monthLabel);
    doc.moveDown();
    doc.fillColor("#000");

    doc.fontSize(14).text("Übersicht");
    doc.fontSize(11);
    doc.text(`Ausgaben gesamt: ${formatMoney(metrics.currentTotal, metrics.currency)}`);
    doc.text(`Transaktionen: ${metrics.transactionCount}`);
    doc.text(`Tagesdurchschnitt: ${formatMoney(metrics.dailyAverage, metrics.currency)}`);
    doc.text(
      `Einsparpotenzial: ${formatMoney(metrics.savingsPotential, metrics.currency)}`
    );
    doc.moveDown();

    doc.fontSize(14).text("Top-Kategorien");
    doc.fontSize(11);
    for (const cat of metrics.byCategory.slice(0, 8)) {
      doc.text(`${cat.name}: ${formatMoney(cat.total, metrics.currency)}`);
    }
    doc.moveDown();

    doc.fontSize(14).text("Top-Händler");
    doc.fontSize(11);
    for (const m of metrics.byMerchant.slice(0, 8)) {
      doc.text(`${m.name}: ${formatMoney(m.total, metrics.currency)}`);
    }
    doc.moveDown();

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d >= monthStart && d <= monthEnd;
    });

    doc.fontSize(14).text("Transaktionen (aktueller Monat)");
    doc.fontSize(10);
    for (const tx of monthTx.slice(0, 40)) {
      doc.text(
        `${tx.date}  ${tx.merchant}  ${formatMoney(Number(tx.amount), tx.currency)}`
      );
    }
    if (monthTx.length > 40) {
      doc.text(`… und ${monthTx.length - 40} weitere`);
    }

    doc.end();
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${format(now, "yyyy-MM")}.pdf"`,
    },
  });
}
