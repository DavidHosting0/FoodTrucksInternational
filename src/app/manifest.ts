import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personal Expense Manager",
    short_name: "Expenses",
    description:
      "Persönliche Finanzen verwalten, Budgets tracken und Ausgaben optimieren.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0f0d",
    theme_color: "#1a2e24",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
