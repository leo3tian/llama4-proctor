import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sussi",
  description: "Student Use & Screen Status Interface",
  icons: {
    icon: '/sussi_icon.PNG',
  }
};

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
