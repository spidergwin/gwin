import { prisma } from "./db";

function cleanPrismaError(error: any): string {
  if (!(error instanceof Error)) return String(error);
  
  const lines = error.message.split("\n")
    .map(line => line.trim())
    .filter(line => {
      if (line.length === 0) return false;
      if (line.includes("invocation")) return false;
      if (line.includes("db.ts")) return false;
      if (line.includes("blog-data.ts")) return false;
      if (line.includes("route.ts")) return false;
      if (line.startsWith("at ")) return false;
      if (/^\d+/.test(line)) return false;
      if (line.includes("→")) return false;
      if (line.includes("/home/")) return false;
      return true;
    });
  
  if (lines.length > 0) {
    return lines[0];
  }
  return error.message.trim().split("\n")[0];
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  snippet: string;
  content: string;
}

export const blogPosts: BlogPost[] = [];

// In-memory fallback database cache to allow CRUD operations even if the database is offline/unauthenticated
let memoryPosts: BlogPost[] = [];

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (post) return post;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to fetch post for slug "${slug}": ${errMsg}. Falling back to memory.`);
  }
  return memoryPosts.find((p) => p.slug === slug);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const dbPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (dbPosts.length > 0) {
      return dbPosts;
    }
    return [];
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to fetch posts: ${errMsg}. Falling back to memory.`);
    return memoryPosts;
  }
}

export async function createPost(post: Omit<BlogPost, "id">): Promise<BlogPost> {
  try {
    const created = await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        date: post.date,
        readTime: post.readTime,
        category: post.category,
        snippet: post.snippet,
        content: post.content,
      },
    });
    // Sync to memory
    const memoryPost: BlogPost = { id: created.id, ...post };
    memoryPosts = [memoryPost, ...memoryPosts];
    return created;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to create post: ${errMsg}. Falling back to memory.`);
    const mockId = Math.random().toString(36).substring(2, 11);
    const mockPost: BlogPost = { id: mockId, ...post };
    memoryPosts = [mockPost, ...memoryPosts];
    return mockPost;
  }
}

export async function updatePost(slug: string, post: Partial<Omit<BlogPost, "id">>): Promise<BlogPost> {
  try {
    const updated = await prisma.blogPost.update({
      where: { slug },
      data: post,
    });
    // Sync to memory
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx !== -1) {
      memoryPosts[idx] = { ...memoryPosts[idx], ...post };
    }
    return updated;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to update post for slug "${slug}": ${errMsg}. Falling back to memory.`);
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      throw new Error(`Post with slug ${slug} not found in memory fallback.`);
    }
    const updatedMockPost = { ...memoryPosts[idx], ...post };
    memoryPosts[idx] = updatedMockPost;
    return updatedMockPost;
  }
}

export async function deletePost(slug: string): Promise<BlogPost> {
  try {
    const deleted = await prisma.blogPost.delete({
      where: { slug },
    });
    // Sync to memory
    memoryPosts = memoryPosts.filter((p) => p.slug !== slug);
    return deleted;
  } catch (error) {
    const errMsg = cleanPrismaError(error);
    console.warn(`[Database Warning] Failed to delete post for slug "${slug}": ${errMsg}. Falling back to memory.`);
    const idx = memoryPosts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      throw new Error(`Post with slug ${slug} not found in memory fallback.`);
    }
    const deletedMockPost = memoryPosts[idx];
    memoryPosts = memoryPosts.filter((p) => p.slug !== slug);
    return deletedMockPost;
  }
}
