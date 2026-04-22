import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Your Salon",
    short_name: "Your Salon",
    description:
      "Your Salon — a precision hair studio in South Kensington, London. Cuts, colour and care.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0806",
    theme_color: "#c9a961",
    orientation: "portrait",
    lang: "en-GB",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
