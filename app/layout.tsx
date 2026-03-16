import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import { StoreInitializer } from '@/components/StoreInitializer';
import "./globals.css";

// Inter for both display and body - Apple style
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const interBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Chainlex.ai",
  description: "RWA Asset Modeling Tool",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interBody.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
