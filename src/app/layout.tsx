import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hub",
  description: "Dashboard for Joche tools and apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
