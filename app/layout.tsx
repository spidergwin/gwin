import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Joseph Godfrey — Software Engineer",
  description:
    "Portfolio of Joseph Godfrey, a Software Engineer specializing in systems programming (Rust, Go, C) and full-stack web development (Next.js, React, TypeScript).",
  keywords: [
    "Joseph Godfrey",
    "Software Engineer",
    "Systems Programming",
    "Full-Stack Developer",
    "Rust",
    "Go",
    "TypeScript",
    "Python",
    "Next.js",
    "Portfolio",
  ],
  authors: [{ name: "Joseph Godfrey", url: "https://github.com/spidergwin" }],
  openGraph: {
    title: "Joseph Godfrey — Software Engineer",
    description:
      "Systems programmer and full-stack engineer. Building kernels, compilers, and elegant web applications.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joseph Godfrey — Software Engineer",
    description:
      "Systems programmer and full-stack engineer. Building kernels, compilers, and elegant web applications.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
