import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Podcast Scene Generator",
  description: "Generate AI-powered podcast scenes with video visualization using advanced AI models",
  keywords: ["AI", "podcast", "scene generator", "video generation", "artificial intelligence"],
  authors: [{ name: "AI Podcast Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-slate-800">
                🎙️ AI Podcast Scene Generator
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Transform your ideas into cinematic podcast scenes with AI
              </p>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200 py-6">
            <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
              <p>Powered by Claude Sonnet 4 & Google Veo-3 • Built with Next.js & Tailwind CSS</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}