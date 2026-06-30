import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Prayer Wall — Bring Your Burdens",
  description: "A community prayer wall. Submit your prayer and let others stand with you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-100">
        <Navbar />
        <main>{children}</main>
        <footer className="mt-24 py-10 border-t border-cream-200 text-center text-sm text-navy-700/50">
          <p className="font-serif italic">"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7</p>
          <p className="mt-2">Prayer Wall · Built with love</p>
        </footer>
      </body>
    </html>
  );
}
