import type { Metadata, Viewport } from "next";
import { Geist, Inter, Manrope, Playfair_Display, Cormorant_Garamond, Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { LangProvider } from "../lib/i18n";
import { ThemeProvider, themeBootScript } from "../lib/theme";
import { EditorProvider } from "../lib/editorClient";
import { CartProvider } from "../lib/cartClient";
import { loadContent } from "../lib/content";
import { loadBranding, loadBusiness, loadNav, loadAnalytics, loadTheme, loadTypography, FONT_VAR } from "../lib/settings";
import { seoDefaults } from "../lib/seoDefaults";
import { BrandingProvider } from "../lib/brandingClient";
import { BusinessProvider } from "../lib/businessClient";
import { NavProvider } from "../lib/navClient";
import EditorPanel from "./components/EditorPanel";
import JsonLd from "./JsonLd";
import PageTracker from "./components/PageTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
const FONT_VARS = `${geistSans.variable} ${inter.variable} ${manrope.variable} ${playfair.variable} ${cormorant.variable} ${fraunces.variable}`;

function isLightColor(bg: string): boolean {
  const hex = bg.trim();
  if (!hex.startsWith("#")) return false;
  const c = hex.length === 4
    ? hex.slice(1).split("").map((x) => parseInt(x + x, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  // relative luminance
  const l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  return l > 160;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spade.gr";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await loadBranding();
  const business = await loadBusiness();
  const favicon = branding.faviconUrl || "/favicon.ico";
  const content = (await loadContent()) as Record<
    string,
    Partial<{ title_en: string; description_en: string; ogImage: string }>
  >;
  const stored = content.seo_home ?? {};
  const computed = seoDefaults("seo_home", business);
  const homeTitle = stored.title_en || computed.title_en;
  const homeDesc = stored.description_en || computed.description_en;
  const homeOg = stored.ogImage || "/og.jpg";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: homeTitle,
      template: "%s · Spade Barber Loutraki",
    },
    description: homeDesc,
    keywords: [
      "barber Loutraki",
      "κουρείο Λουτράκι",
      "Spade barber",
      "κουρείο κοντά μου",
      "men's grooming",
      "ξύρισμα Λουτράκι",
      "κούρεμα Λουτράκι",
      "beard trim Loutraki",
    ],
    applicationName: "Spade Barber",
    authors: [{ name: "Spade Barber" }],
    creator: "Spade Barber Loutraki",
    publisher: "Spade Barber Loutraki",
    alternates: {
      canonical: "/",
      languages: {
        "el-GR": "/",
        "en-US": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: "el_GR",
      alternateLocale: ["en_US"],
      url: SITE_URL,
      siteName: "Spade Barber Loutraki",
      title: homeTitle,
      description: homeDesc,
      images: [
        {
          url: homeOg,
          width: 1200,
          height: 630,
          alt: "Spade Barber Shop Loutraki",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: homeDesc,
      images: [homeOg],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: favicon,
      apple: favicon,
    },
    formatDetection: {
      telephone: true,
      address: true,
      email: true,
    },
    verification: {
      // add your Google Search Console token here once you have one
      // google: "XXXXXXXXXXXXXXXX",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
  const initialBranding = await loadBranding();
  const initialBusiness = await loadBusiness();
  const initialNav = await loadNav();
  const analytics = await loadAnalytics();
  const theme = await loadTheme();
  const typography = await loadTypography();
  const headingVar = FONT_VAR[typography.headingFont];
  const bodyVar = FONT_VAR[typography.bodyFont];
  const themeCss = `:root{--background:${theme.background};--foreground:${theme.foreground};--gold:${theme.primary};--gold-2:${theme.primaryAccent};--surface:${theme.surface};--surface-strong:${theme.surfaceStrong};--border:${theme.border};--border-strong:${theme.borderStrong};--muted:${theme.muted};--muted-2:${theme.muted2};--font-heading:${headingVar};--font-body:${bodyVar};}body{font-family:var(--font-body),system-ui,sans-serif;}.font-serif{font-family:var(--font-heading),Georgia,serif;}`;
  const isLight = isLightColor(theme.background);
  return (
    <html
      lang="el"
      data-scroll-behavior="smooth"
      data-theme={isLight ? "light" : "dark"}
      suppressHydrationWarning
      className={`${FONT_VARS} h-full antialiased${isLight ? " light" : ""}`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <JsonLd />
        {analytics.gtm && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.gtm}');`,
            }}
          />
        )}
        {analytics.ga4 && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.ga4}');`,
              }}
            />
          </>
        )}
        {analytics.metaPixel && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.metaPixel}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body
        className="flex min-h-full flex-col overflow-x-hidden"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {analytics.gtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analytics.gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <ThemeProvider>
          <LangProvider>
            <BrandingProvider initial={initialBranding}>
              <BusinessProvider initial={initialBusiness}>
                <NavProvider initial={initialNav}>
                  <EditorProvider initialContent={initialContent}>
                    <CartProvider>
                      <Nav />
                      <div className="flex-1">{children}</div>
                      <Footer />
                      <EditorPanel />
                      <PageTracker />
                    </CartProvider>
                  </EditorProvider>
                </NavProvider>
              </BusinessProvider>
            </BrandingProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
