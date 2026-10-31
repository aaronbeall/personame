import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'
import { AppChrome } from '@/components/app-chrome'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personame - Create Custom Personality Quizzes",
  description: "Design and share engaging personality assessments with custom dimensions and archetypes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  )
}


