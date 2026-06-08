import { NextResponse } from "next/server";
import { getPostBySlug, updatePost, deletePost } from "@/lib/blog-data";

const API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  
  const token = authHeader.replace("Bearer ", "").trim();
  return token === API_KEY;
}

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: ParamsProps) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch post", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: ParamsProps) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
      { status: 401 }
    );
  }

  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Check if post exists
    const existing = await getPostBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Estimate read time if content is changing and readTime is not provided
    if (body.content && !body.readTime) {
      const words = body.content.split(/\s+/).length;
      body.readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    }

    // Estimate snippet if content is changing and snippet is not provided
    if (body.content && !body.snippet) {
      body.snippet = body.content.substring(0, 150).replace(/\n/g, " ") + "...";
    }

    const updated = await updatePost(slug, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update post", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: ParamsProps) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Please provide a valid API key in the Authorization header." },
      { status: 401 }
    );
  }

  try {
    const { slug } = await params;
    
    // Check if post exists
    const existing = await getPostBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const deleted = await deletePost(slug);
    return NextResponse.json({ message: "Post deleted successfully", post: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete post", details: error.message },
      { status: 500 }
    );
  }
}
