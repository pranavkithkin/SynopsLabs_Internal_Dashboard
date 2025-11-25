import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next';
import { V0Provider } from "@/lib/v0-context";
import { AuthProvider } from "@/lib/auth";
import { PermissionProvider } from "@/lib/permissions";
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineDetector } from '@/components/offline-detector';
import { AlfredCommandPalette } from "@/components/alfred/alfred-command-palette";
import { ChatWrapper } from "@/components/chat/chat-wrapper";
import { QueryProvider } from "@/components/providers/query-provider";
import localFont from "next/font/local";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

export const metadata: Metadata = {
  title: {
    template: "%s – Synops Labs",
    default: "Synops Labs Dashboard",
  },
  description:
    "Enterprise AI Agent Consultancy Dashboard - Business Metrics & KPI Tracking",
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased bg-black text-white`}
      >
        <V0Provider isV0={isV0}>
          <QueryProvider>
            <AuthProvider>
              <PermissionProvider>
                <ErrorBoundary>
                  <OfflineDetector />
                  {children}
                  {/* Alfred AI Assistant - Keyboard only (Cmd+K / Ctrl+K) */}
                  <AlfredCommandPalette />
                  {/* iPhone Messages-style Chat */}
                  <ChatWrapper />
                </ErrorBoundary>
              </PermissionProvider>
            </AuthProvider>
          </QueryProvider>
        </V0Provider>
      </body>
    </html>
  );
}
