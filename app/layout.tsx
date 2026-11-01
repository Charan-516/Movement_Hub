import type { Metadata } from "next";
import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/familjen-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Volunteer",
  description: "Sign up to volunteer with an invite link, or sign in to run events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
