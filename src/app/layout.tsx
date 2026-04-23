import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Manrope } from "next/font/google";

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
        <Script
          id="skillbridge-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-background text-on-background antialiased`}>
        {children}
      </body>
    </html>
  );
}
