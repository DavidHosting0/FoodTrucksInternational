export const HOME_SPACES = [
  { id: "home", title: "Home", short: "Home" },
  { id: "list", title: "Liste", short: "Liste" },
  { id: "capture", title: "Erfassen", short: "+" },
  { id: "budget", title: "Budget", short: "Budget" },
  { id: "more", title: "Mehr", short: "Mehr" },
] as const;

export type HomeSpaceId = (typeof HOME_SPACES)[number]["id"];

const ALIASES: Record<string, HomeSpaceId> = {
  home: "home",
  overview: "home",
  list: "list",
  activity: "list",
  capture: "capture",
  plus: "capture",
  budget: "budget",
  budgets: "budget",
  more: "more",
  settings: "more",
};

export function resolveSpaceId(value?: string | null): HomeSpaceId {
  if (!value) return "home";
  return ALIASES[value] ?? "home";
}
