import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toolbox — vertical video for the trades',
  description:
    'TikTok-style vertical video for plumbers, electricians, HVAC techs, carpenters, roofers and more.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#FFC107',
          colorBackground: '#0A0A0A',
          colorText: '#FAFAFA',
          colorInputBackground: '#1A1A1A',
          colorInputText: '#FAFAFA',
          borderRadius: '10px',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
