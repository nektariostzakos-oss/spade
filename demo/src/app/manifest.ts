import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spade Barber Loutraki",
    short_name: "Spade",
    description:
      "Spade Barber Shop in Loutraki. Classic cuts, sharp fades, hot shaves.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0806",
    theme_color: "#c9a961",
    orientation: "portrait",
    lang: "el",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
