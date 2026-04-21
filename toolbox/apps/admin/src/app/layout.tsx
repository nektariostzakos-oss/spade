import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toolbox Admin',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-dvh bg-[#0A0A0A] text-[#FAFAFA]">
          <header className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
            <Link href="/" className="font-mono text-sm uppercase tracking-widest">
              Toolbox · Admin
            </Link>
            <nav className="flex gap-6 text-sm text-[#A8A8A8]">
              <Link href="/verification">Verification</Link>
              <Link href="/moderation">Moderation</Link>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
