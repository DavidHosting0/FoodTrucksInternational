import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTransactions } from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

function csvEscape(value: string | number | null | undefined) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!isDemoMode()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const transactions = await getTransactions();
  const header = [
    "date",
    "merchant",
    "amount",
    "currency",
    "category",
    "description",
    "necessity",
    "payment_method",
  ];

  const lines = [
    header.join(","),
    ...transactions.map((tx) =>
      [
        tx.date,
        tx.merchant,
        tx.amount,
        tx.currency,
        tx.categories?.name ?? "",
        tx.description,
        tx.necessity ?? "",
        tx.payment_method ?? "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
