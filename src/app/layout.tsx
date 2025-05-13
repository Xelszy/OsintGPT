import React from 'react';
import './globals.css';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'AI Pentest App',
  description: 'Advanced AI-powered penetration testing and security analysis tool',
};

// Move viewport and themeColor from metadata to viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${poppins.className}`}>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
} 