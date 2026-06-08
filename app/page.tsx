import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { UiTerminal } from "@/components/ui-terminal"
import { ProjectsGrid } from "@/components/projects-grid"
import { getPinnedProjects } from "@/lib/github"
import { getAllPosts } from "@/lib/blog-data"
import {
  IconCpu,
  IconDatabase,
  IconAppWindow,
  IconArrowRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react"

// Cache page for 1 hour to prevent constant API calling to GitHub during navigations
export const revalidate = 3600

export default async function Page() {
  const githubProjects = await getPinnedProjects(
    process.env.GITHUB_USERNAME || "spidergwin"
  )
  const blogPosts = (await getAllPosts()).slice(0, 3)

  const services = [
    {
      icon: <IconCpu className="size-6 text-foreground" />,
      title: "Systems Programming",
      desc: "Developing high-performance, memory-safe, and concurrent tools and custom system applications in Rust, Go, and C. Experience building x86_64 kernels, interpreters, and compilers.",
    },
    {
      icon: <IconAppWindow className="size-6 text-foreground" />,
      title: "Full-Stack Engineering",
      desc: "Creating robust web apps using Next.js, React, Node.js, and TypeScript. Designing fluid, accessible interfaces paired with solid server-side APIs and services.",
    },
    {
      icon: <IconDatabase className="size-6 text-foreground" />,
      title: "Backend Architecture",
      desc: "Designing databases, memory caches, and microservices with PostgreSQL, Redis, and WebSockets. Focused on latency reduction, throughput, and clean interface integration.",
    },
  ]

  return (
    <div className="flex min-h-screen scrollbar-thumb-secondary flex-col bg-background font-sans text-foreground transition-colors duration-300 selection:bg-foreground selection:text-background">
      <Header />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden border-b border-border/40 px-6 py-12 md:py-24">
        {/* Background Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
          <span className="translate-y-10 transform text-[12vw] leading-none font-black tracking-[0.15em] text-foreground/[0.02] uppercase select-none dark:text-foreground/[0.015]">
            PORTFOLIO
          </span>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Vertical Metadata Columns (Left Side) */}
          <div className="hidden h-96 flex-col justify-between text-[10px] tracking-[0.25em] text-muted-foreground uppercase select-none lg:col-span-1 lg:flex">
            <div className="origin-left translate-x-2 translate-y-8 rotate-270 whitespace-nowrap">
              Software Engineer
            </div>
            <div className="mt-auto origin-left translate-x-2 rotate-270 whitespace-nowrap">
              Joseph Godfrey
            </div>
          </div>

          {/* Hero Typography & Stats */}
          <div className="flex flex-col justify-center space-y-12 lg:col-span-5">
            {/* Top Stats block from Design */}
            <div className="flex gap-12 select-none sm:gap-16">
              <div>
                <h3 className="text-3xl font-light tracking-tight sm:text-4xl">
                  5+
                </h3>
                <p className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Years of Experience
                </p>
              </div>
              <div>
                <h3 className="text-3xl font-light tracking-tight sm:text-4xl">
                  1
                </h3>
                <p className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase hover:underline">
                  Startup (
                  <Link href="https://last-minutes.vercel.app" target="_blank">
                    Last Minutes
                  </Link>
                  )
                </p>
              </div>
            </div>

            {/* Main Greeting Typography */}
            <div className="space-y-4">
              <h1 className="text-7xl leading-none font-light tracking-tighter select-none sm:text-8xl md:text-9xl">
                Hello
              </h1>
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground sm:text-base">
                <span className="inline-block h-px w-6 bg-muted-foreground" />
                It&apos;s Joseph Godfrey AKA Gwin, a Software Engineer
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#portfolio"
                className="rounded-full bg-primary px-6 py-3 text-xs font-bold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
              >
                View Portfolio
              </a>
              <a
                href="#contact"
                className="rounded-full border border-border bg-card px-6 py-3 text-xs font-bold tracking-wider text-foreground uppercase transition-colors hover:bg-muted"
              >
                Get In Touch
              </a>
            </div>
          </div>

          {/* Hero Image Container (Right Side) */}
          <div className="relative flex justify-center lg:col-span-6 lg:justify-end">
            <div className="group relative h-96 w-80 overflow-hidden sm:h-[420px] sm:w-[360px] lg:h-[530px] lg:w-[440px]">
              {/* Grayscale filter transition to show premium aesthetic on hover */}
              <Image
                src="/gwinpronobg.png"
                alt="Joseph Godfrey — Software Engineer"
                fill
                priority
                className="object-cover object-top grayscale transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0 dark:brightness-90 dark:contrast-110"
                sizes="(max-width: 768px) 320px, (max-width: 1024px) 360px, 440px"
              />
              {/* Bottom gradient fade into background */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Horizontal Scroll down label for mobile */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 text-[9px] tracking-widest text-muted-foreground uppercase lg:hidden">
              <span>Scroll down</span>
              <span>&darr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="border-b border-border/40 bg-card/30 px-6 py-20"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
              01 // About Me
            </h2>
            <h3 className="mt-4 text-3xl leading-tight font-light tracking-tight text-foreground sm:text-4xl">
              Bridging the gap between low-level performance and elegant web
              systems.
            </h3>
          </div>

          <div className="space-y-6 text-sm leading-loose text-muted-foreground lg:col-span-8">
            <p>
              I am a Software Engineer driven by a passion for exploring how
              software operates at every tier. My expertise spans systems-level
              programming—such as designing custom monolithic kernels, compiler
              toolchains, and memory schedulers—to architecture-heavy, fullstack
              web interfaces utilizing cutting-edge Next.js patterns.
            </p>
            <p>
              Whether crafting high-performance CLI tools, coding socket
              services in Go, or architecting modular design systems in React, I
              focus on performance optimization, robust accessibility standards,
              and clean developer experiences.
            </p>

            {/* Skill list tags */}
            <div className="pt-6">
              <h4 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">
                Core Competencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Rust",
                  "Go",
                  "TypeScript",
                  "Next.js",
                  "C/C++",
                  "Kernel Dev",
                  "Compiler Design",
                  "TailwindCSS",
                  "PostgreSQL",
                  "Redis",
                  "Docker",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Terminal Section */}
      <section className="border-b border-border/40 px-6 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <h2 className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
              02 // Systems Console
            </h2>
            <h3 className="text-3xl leading-tight font-light tracking-tight text-foreground sm:text-4xl">
              Test my system right in the browser
            </h3>
            <p className="text-sm leading-loose text-muted-foreground">
              To emphasize my systems background, I've built a simulated
              command-line shell interface. Type commands like{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                neofetch
              </code>{" "}
              to view specifications,
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                skills
              </code>{" "}
              to list tech stacks, or
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                help
              </code>{" "}
              to discover other interactions.
            </p>
          </div>

          <div className="lg:col-span-7">
            <UiTerminal />
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section
        id="portfolio"
        className="border-b border-border/40 bg-card/30 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
                03 // Selected Projects
              </h2>
              <h3 className="mt-4 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
                GitHub Repositories & Deployments
              </h3>
            </div>
            <a
              href="https://github.com/spidergwin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 border-b border-foreground pb-0.5 text-xs font-bold tracking-widest uppercase transition-opacity hover:opacity-75"
            >
              Explore all repositories <IconArrowRight className="size-4" />
            </a>
          </div>

          {/* Grid component containing logic for sorting and filtering */}
          <ProjectsGrid initialProjects={githubProjects} />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="border-b border-border/40 px-6 py-20">
        <div className="mx-auto max-w-7xl space-y-12">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
              04 // Expertise
            </h2>
            <h3 className="mt-4 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              Services Offered
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="space-y-4 rounded-xl border border-border bg-card/50 p-8 transition-colors hover:border-foreground/30"
              >
                <div className="w-fit rounded-lg bg-muted p-3">{svc.icon}</div>
                <h4 className="text-lg font-bold text-foreground">
                  {svc.title}
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        id="blog"
        className="border-b border-border/40 bg-card/30 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
                05 // Technical Writing
              </h2>
              <h3 className="mt-4 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
                Latest Publications & Notebooks
              </h3>
            </div>
            <Link
              href="/blog"
              className="inline-flex w-fit items-center gap-1.5 border-b border-foreground pb-0.5 text-xs font-bold tracking-widest uppercase transition-opacity hover:opacity-75"
            >
              View All Articles <IconArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block"
              >
                <article className="group flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-foreground/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h4 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h4>
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {post.snippet}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 pt-6 text-xs font-bold text-foreground transition-opacity group-hover:opacity-75">
                    <span>Read Article</span>
                    <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="bg-foreground px-6 py-24 text-background"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <h2 className="text-[10px] font-semibold tracking-[0.25em] text-background/60 uppercase">
              06 // Get in Touch
            </h2>
            <h3 className="text-4xl leading-tight font-light tracking-tighter sm:text-5xl lg:text-6xl">
              Let's create something extraordinary.
            </h3>
            <p className="max-w-md text-xs leading-relaxed text-background/75 sm:text-sm">
              Whether you need assistance building high-performance systems
              utilities, a scalable web application, or want to hire me, drop me
              a line or book a technical consultation call!
            </p>
            <div className="flex items-center gap-6 pt-4">
              <a
                href="https://github.com/spidergwin"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-background/10 p-2 transition-colors hover:bg-background/20"
                title="GitHub"
              >
                <IconBrandGithub className="size-5 text-background" />
              </a>
              <a
                href="https://www.linkedin.com/in/gwinofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-background/10 p-2 transition-colors hover:bg-background/20"
                title="LinkedIn"
              >
                <IconBrandLinkedin className="size-5 text-background" />
              </a>
              <a
                href="mailto:gwinofficial1@gmail.com"
                className="rounded-full bg-background/10 p-2 transition-colors hover:bg-background/20"
                title="Email"
              >
                <IconMail className="size-5 text-background" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Quick Contact Form inside the page */}
            <form className="ml-auto max-w-md space-y-4 text-background">
              <div className="space-y-1">
                <label
                  className="text-[10px] font-semibold tracking-wider text-background/60 uppercase"
                  htmlFor="contact-name"
                >
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-background/20 bg-background/5 px-4 py-2.5 text-sm text-background transition-colors outline-none placeholder:text-background/40 focus:border-background/50"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-[10px] font-semibold tracking-wider text-background/60 uppercase"
                  htmlFor="contact-email"
                >
                  Your Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-background/20 bg-background/5 px-4 py-2.5 text-sm text-background transition-colors outline-none placeholder:text-background/40 focus:border-background/50"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-[10px] font-semibold tracking-wider text-background/60 uppercase"
                  htmlFor="contact-msg"
                >
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  required
                  placeholder="Hello Joseph, I'd love to chat about a systems/fullstack role..."
                  className="w-full resize-none rounded-lg border border-background/20 bg-background/5 px-4 py-2.5 text-sm text-background transition-colors outline-none placeholder:text-background/40 focus:border-background/50"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-background py-3 text-xs font-bold tracking-widest text-foreground uppercase transition-opacity hover:opacity-90"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10 px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Joseph Godfrey. All rights
            reserved.
          </p>
          <p className="flex items-center gap-2"></p>
        </div>
      </footer>
    </div>
  )
}
