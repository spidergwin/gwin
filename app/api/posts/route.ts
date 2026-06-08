import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/lib/blog-data";
import { prisma } from "@/lib/db";

// Use an environment variable or fallback for development security
const API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  
  const token = authHeader.replace("Bearer ", "").trim();
  return token === API_KEY;
}

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, content, category, snippet, slug, date, readTime } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and Content are required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug is unique
    try {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: finalSlug }
      });
      if (existing) {
        return NextResponse.json(
          { error: `A blog post with slug '${finalSlug}' already exists.` },
          { status: 409 }
        );
      }
    } catch (dbError) {
      // If database isn't connected/migrated yet
      console.warn("Database slug check failed:", dbError);
    }

    // Format date if not provided
    const finalDate = date || new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    // Estimate read time if not provided
    const words = content.split(/\s+/).length;
    const finalReadTime = readTime || `${Math.max(1, Math.ceil(words / 200))} min read`;

    const finalCategory = category || "General";
    const finalSnippet = snippet || content.substring(0, 150).replace(/\n/g, " ") + "...";

    const newPost = await createPost({
      title,
      content,
      category: finalCategory,
      snippet: finalSnippet,
      slug: finalSlug,
      date: finalDate,
      readTime: finalReadTime
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create post", details: error.message },
      { status: 500 }
    );
  }
}
