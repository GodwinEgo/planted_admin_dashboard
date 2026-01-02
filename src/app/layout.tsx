import { AuthProvider } from "@/lib/auth-context";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planted Admin Dashboard",
  description: "Admin dashboard for Planted - Children's Bible App",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
