import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers'
import { AppHeader } from '@/components/app-header'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personame - Create Custom Personality Quizzes",
  description: "Design and share engaging personality assessments with custom metrics and archetypes",
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
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}


