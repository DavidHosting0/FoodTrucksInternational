import { hash } from "bcryptjs";
import postgres from "postgres";

const email = "finanzen@fig.global";
const password = "FIG";
const displayName = "FIG Finanzen";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL fehlt");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

const DEFAULT_CATEGORIES = [
  { name: "Lebensmittel", icon: "shopping-basket", color: "#22c55e" },
  { name: "Restaurants & Takeaway", icon: "utensils", color: "#f97316" },
  { name: "Getränke & Snacks", icon: "coffee", color: "#eab308" },
  { name: "Transport & Mobilität", icon: "bus", color: "#3b82f6" },
  { name: "Auto", icon: "car", color: "#64748b" },
  { name: "Wohnen", icon: "home", color: "#8b5cf6" },
  { name: "Versicherungen", icon: "shield", color: "#06b6d4" },
  { name: "Gesundheit", icon: "heart-pulse", color: "#ef4444" },
  { name: "Kleidung", icon: "shirt", color: "#ec4899" },
  { name: "Elektronik & Technik", icon: "cpu", color: "#14b8a6" },
  { name: "Freizeit", icon: "gamepad-2", color: "#a855f7" },
  { name: "Reisen", icon: "plane", color: "#0ea5e9" },
  { name: "Abonnements", icon: "repeat", color: "#84cc16" },
  { name: "Shopping", icon: "shopping-bag", color: "#f43f5e" },
  { name: "Sonstiges", icon: "more-horizontal", color: "#94a3b8" },
];

try {
  const existing = await sql`select id from users where email = ${email} limit 1`;
  if (existing.length) {
    console.log("Account existiert bereits:", email);
  } else {
    const passwordHash = await hash(password, 12);
    const [user] = await sql`
      insert into users (email, password_hash)
      values (${email}, ${passwordHash})
      returning id
    `;
    await sql`
      insert into profiles (id, display_name)
      values (${user.id}, ${displayName})
    `;
    for (const cat of DEFAULT_CATEGORIES) {
      await sql`
        insert into categories (user_id, name, icon, color, is_default)
        values (${user.id}, ${cat.name}, ${cat.icon}, ${cat.color}, true)
        on conflict do nothing
      `;
    }
    console.log("Standard-Account angelegt:", email);
  }
} finally {
  await sql.end({ timeout: 5 });
}
