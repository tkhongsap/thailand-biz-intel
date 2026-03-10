import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TH-BIZ INTEL — Chiang Mai Business Intelligence",
  description: "Area-based business intelligence platform for Chiang Mai, Thailand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body>{children}</body>
    </html>
  );
}
