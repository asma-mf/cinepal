// Root layout: Clerk provider wraps all routes
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CinePal Admin',
  description: 'Movie booking platform admin panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} h-full`}>
        <body className="min-h-full bg-gray-950 text-gray-100 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
