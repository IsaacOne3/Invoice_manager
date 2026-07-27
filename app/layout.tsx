import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commercial Documents",
  description: "A private workspace for creating and managing commercial documents.",
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
