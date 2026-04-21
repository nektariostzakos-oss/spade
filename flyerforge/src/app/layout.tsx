import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlyerForge — AI Flyer Studio",
  description:
    "One photo + one form. Six sized flyer assets out. AI writes the copy, you pick the look.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
