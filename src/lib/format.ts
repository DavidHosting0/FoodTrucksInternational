import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function formatMoney(
  amount: number,
  currency: string = "CHF",
  locale: string = "de-CH"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "dd.MM.yyyy", { locale: de });
}

export function formatMonthLabel(date: string | Date) {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "MMM yyyy", { locale: de });
}

export function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
