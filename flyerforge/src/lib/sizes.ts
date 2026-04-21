export type AssetSize = {
  id: string;
  label: string;
  width: number;
  height: number;
  filename: string;
};

export const SIZES: AssetSize[] = [
  {
    id: "ig-story",
    label: "Instagram Story",
    width: 1080,
    height: 1920,
    filename: "instagram-story.png",
  },
  {
    id: "ig-reel-cover",
    label: "Instagram Reel cover",
    width: 1080,
    height: 1920,
    filename: "instagram-reel-cover.png",
  },
  {
    id: "ig-feed",
    label: "Instagram Feed",
    width: 1080,
    height: 1350,
    filename: "instagram-feed.png",
  },
  {
    id: "fb-event",
    label: "Facebook event cover",
    width: 1200,
    height: 628,
    filename: "facebook-event-cover.png",
  },
  {
    id: "print-a5",
    label: "Printable A5 (300dpi)",
    width: 1748,
    height: 2480,
    filename: "print-a5-300dpi.png",
  },
  {
    id: "wa-status",
    label: "WhatsApp status",
    width: 1080,
    height: 1920,
    filename: "whatsapp-status.png",
  },
];
