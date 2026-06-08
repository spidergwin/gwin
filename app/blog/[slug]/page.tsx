import { Header } from "@/components/header";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { IconArrowLeft, IconArrowRight, IconClock, IconCalendar } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Joseph Godfrey`,
    description: post.snippet,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const currentIdx = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col font-sans transition-colors duration-300">
      <Header />

      {/* Article Header */}
      <section className="pt-12 pb-8 px-6 border-b border-border/40">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft className="size-3.5" />
            All Articles
          </Link>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
            <span className="px-2 py-0.5 border border-border rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <IconCalendar className="size-3.5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconClock className="size-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* Prev / Next Navigation */}
      <section className="py-12 px-6 border-t border-border/40 bg-card/30">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group p-6 border border-border/60 rounded-xl hover:border-foreground/30 transition-colors space-y-2"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <IconArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                Previous
              </div>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {prevPost.title}
              </h4>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group p-6 border border-border/60 rounded-xl hover:border-foreground/30 transition-colors space-y-2 text-right"
            >
              <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Next
                <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {nextPost.title}
              </h4>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-border/40 text-center text-xs text-muted-foreground bg-muted/10">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Joseph Godfrey. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with Next.js &amp; Tailwind</span>
            <span>&bull;</span>
            <span>Nigeria</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
