import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NodoTech · Análisis con atribución real",
  description:
    "Dashboard de atribución multi-touch y ROAS real reconciliado contra ventas POS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--surface-3)",
              border: "1px solid var(--border-2)",
              color: "var(--text)",
            },
          }}
        />
      </body>
    </html>
  );
}
