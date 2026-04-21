import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { LangProvider } from "../lib/i18n";
import { ThemeProvider, themeBootScript } from "../lib/theme";
import { EditorProvider } from "../lib/editorClient";
import { CartProvider } from "../lib/cartClient";
import { loadContent } from "../lib/content";
import EditorPanel from "./components/EditorPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spade.gr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spade — Barber & Grooming · Loutraki",
    template: "%s · Spade Barber Loutraki",
  },
  description:
    "Spade Barber Shop in Loutraki. Classic cuts, sharp fades, hot shaves. Book your chair online.",
  keywords: [
    "barber Loutraki",
    "κουρείο Λουτράκι",
    "Spade barber",
    "men's grooming",
    "ξύρισμα",
    "κούρεμα Λουτράκι",
  ],
  applicationName: "Spade Barber",
  authors: [{ name: "Spade Barber" }],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      el: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "el_GR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "Spade Barber Loutraki",
    title: "Spade — Barber & Grooming · Loutraki",
    description:
      "Classic cuts, sharp fades, hot shaves. El. Venizelou 37, Loutraki.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spade — Barber & Grooming · Loutraki",
    description: "Classic cuts, sharp fades, hot shaves. Book online.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0706" },
    { media: "(prefers-color-scheme: light)", color: "#f5ede2" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialContent = (await loadContent()) as Record<
    string,
    Record<string, unknown>
  >;
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className="flex min-h-full flex-col"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <ThemeProvider>
          <LangProvider>
            <EditorProvider initialContent={initialContent}>
              <CartProvider>
                <Nav />
                <div className="flex-1">{children}</div>
                <Footer />
                <EditorPanel />
              </CartProvider>
            </EditorProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
