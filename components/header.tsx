"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { IconSun, IconMoon, IconMenu2, IconX } from "@tabler/icons-react"
import { BookCallModal } from "@/components/book-call-modal"

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === "/"

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    if (!isHome) {
      // Navigate home first, then scroll
      window.location.href = `/#${id}`
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navItems = [
    { label: "About Me", action: () => scrollToSection("about") },
    { label: "Portfolio", action: () => scrollToSection("portfolio") },
    { label: "Services", action: () => scrollToSection("services") },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 focus:outline-none"
            aria-label="Home"
          >
            <div className="relative flex h-8 items-center justify-center rounded-lg bg-foreground px-3.5 text-sm font-semibold tracking-wider text-background uppercase transition-transform group-hover:scale-105">
              <span>Gwin</span>
              <div className="pointer-events-none absolute -inset-0.5 scale-110 rounded-lg border border-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-xs font-semibold tracking-wider text-muted-foreground uppercase md:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="cursor-pointer transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              Blog
            </Link>
          </nav>

          {/* Right side CTA + Theme switch */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-none"
                aria-label="Toggle theme"
                title="Toggle Dark/Light Mode (Hotkey: d)"
              >
                {resolvedTheme === "dark" ? (
                  <IconSun className="size-4" />
                ) : (
                  <IconMoon className="size-4" />
                )}
              </button>
            )}

            <button
              onClick={() => setIsBookModalOpen(true)}
              className="hidden cursor-pointer items-center gap-1 border-b-2 border-foreground pb-0.5 text-xs font-bold tracking-wider uppercase transition-opacity hover:opacity-75 focus:outline-none sm:inline-flex"
            >
              Book A Call ↗
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-none md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <IconX className="size-5" />
              ) : (
                <IconMenu2 className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="space-y-3 border-t border-border/40 bg-background/95 px-6 py-4 backdrop-blur-md md:hidden">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="block w-full py-2 text-left text-sm font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setIsBookModalOpen(true)
              }}
              className="block w-full py-2 text-left text-sm font-semibold tracking-wider text-foreground uppercase sm:hidden"
            >
              Book A Call ↗
            </button>
          </div>
        )}
      </header>

      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </>
  )
}
