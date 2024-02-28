import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Header from '@/components/Header';
import Providers from '@/components/Providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Evcard Analytics', template: '%s | Evcard Analytics' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', inter.className)}>
        <Providers>
          <Header />

          <main className="max-w-sm min-h-screen container h-full pt-14">
            {children}
          </main>

          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
