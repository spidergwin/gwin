import { Header } from "@/components/header"
import { getAllPosts } from "@/lib/blog-data"
import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog — Joseph Godfrey",
  description:
    "Technical articles on systems programming, compiler design, kernel development, and modern web engineering by Joseph Godfrey.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300 selection:bg-foreground selection:text-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/40 px-6 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
          <span className="text-[14vw] leading-none font-black tracking-[0.15em] text-foreground/[0.02] uppercase select-none dark:text-foreground/[0.015]">
            BLOG
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-3.5" />
            Back to Home
          </Link>
          <h1 className="text-5xl leading-none font-light tracking-tighter sm:text-6xl md:text-7xl">
            Technical Writing
          </h1>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base">
            Deep dives into systems programming, compiler internals, kernel
            development, and modern full-stack engineering.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-0">
          {posts.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <article
                className={`flex flex-col gap-4 py-8 md:flex-row md:items-center md:gap-8 ${
                  idx < posts.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                {/* Number */}
                <div className="hidden w-16 shrink-0 text-5xl font-light text-muted-foreground/30 tabular-nums md:block">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    <span className="rounded-full border border-border px-2 py-0.5">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {post.snippet}
                  </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-muted/10 px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Joseph Godfrey. All rights
            reserved.
          </p>
          <p className="flex items-center gap-2">
            <Link href="/blog/admin" className="hover:underline">
              Admin
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
