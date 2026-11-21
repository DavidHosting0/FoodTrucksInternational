import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIG Finance",
    short_name: "FIG",
    description:
      "Persönliche Finanzen verwalten, Budgets tracken und Ausgaben optimieren.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#07140f",
    theme_color: "#07140f",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/brand/fig-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
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
        purpose: "maskable",
      },
    ],
  };
}
