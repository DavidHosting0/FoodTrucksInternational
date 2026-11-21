import type { TransactionWithCategory } from "@/types/database";
import { roundMoney } from "@/lib/validations/split";

export type PersonShare = {
  carlo: number;
  david: number;
  carloPct: number | null;
  davidPct: number | null;
  hasSplit: boolean;
};

export function transactionPersonShare(
  tx: TransactionWithCategory
): PersonShare {
  const amount = Number(tx.amount) || 0;
  const split = tx.split_data;
  if (!split?.totals) {
    return {
      carlo: 0,
      david: 0,
      carloPct: null,
      davidPct: null,
      hasSplit: false,
    };
  }

  const carlo = Number(split.totals.Carlo) || 0;
  const david = Number(split.totals.David) || 0;
  const base = carlo + david > 0 ? carlo + david : amount;
  if (base <= 0) {
    return {
      carlo,
      david,
      carloPct: 0,
      davidPct: 0,
      hasSplit: true,
    };
  }

  return {
    carlo: roundMoney(carlo),
    david: roundMoney(david),
    carloPct: Math.round((carlo / base) * 100),
    davidPct: Math.round((david / base) * 100),
    hasSplit: true,
  };
}

export function monthPersonTotals(
  transactions: TransactionWithCategory[],
  month: string
) {
  let carlo = 0;
  let david = 0;
  let unsplit = 0;
  let total = 0;

  for (const tx of transactions) {
    if (tx.date.slice(0, 7) !== month) continue;
    const amount = Number(tx.amount) || 0;
    total += amount;
    const share = transactionPersonShare(tx);
    if (!share.hasSplit) {
      unsplit += amount;
      continue;
    }
    carlo += share.carlo;
    david += share.david;
  }

  return {
    carlo: roundMoney(carlo),
    david: roundMoney(david),
    unsplit: roundMoney(unsplit),
    total: roundMoney(total),
  };
}
