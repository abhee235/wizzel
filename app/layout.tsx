import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wizzel",
  description: "Wizzel is a design tool for creating and sharing digital designs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#E5E5E5]`}
      >
        {children}
      </body>
    </html>
  );
}
