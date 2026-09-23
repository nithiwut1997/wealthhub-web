import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthHub",
  description: "A clear view of your financial life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
