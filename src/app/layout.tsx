import type { Metadata } from "next";
import "./globals.css";
import { getDb } from "@/lib/db";
import { seedRealEvents } from "@/lib/seed";

let initialized = false;
function ensureInit() {
  if (initialized) return;
  getDb();
  seedRealEvents();
  initialized = true;
}

export const metadata: Metadata = {
  title: "KinkCal TO — Toronto Queer Event Calendar",
  description: "Your guide to every gay circuit, fetish, leather, latex, BDSM, puppy, furry, drag event in Toronto. Subscribe to the calendar feed.",
  openGraph: {
    title: "KinkCal TO",
    description: "Toronto queer event calendar — circuit, fetish, leather, latex, BDSM, puppy, furry, drag & more",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  ensureInit();
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}