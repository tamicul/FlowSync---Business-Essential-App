import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowSync - Where Work Flows Effortlessly",
  description: "AI-powered business assistant for calendar, tasks, and appointments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
