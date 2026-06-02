import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueryForge",
  description: "A visual query builder for nested database and API filters.",
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
