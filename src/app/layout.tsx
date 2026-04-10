import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import Footer from "@/Components/Layout/Footer";
import Navbar from "@/Components/Layout/Navbar";

import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const themeScript = `
  (function () {
    var storedTheme = localStorage.getItem("theme");
    var theme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  })();
`;

export const metadata: Metadata = {
  title: "SkillBridge",
  description: "Premium tutoring platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-background text-on-background antialiased`}>
        <div className="min-h-screen bg-background text-on-background">
          <Navbar />
          <main className="pt-20">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
