"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconLock,
  IconArrowLeft,
  IconLoader2,
  IconExternalLink,
  IconDeviceFloppy,
  IconLayoutGrid,
  IconSparkles,
} from "@tabler/icons-react"
import Link from "next/link"

interface BlogPost {
  id?: string
  slug: string
  title: string
  date: string
  readTime: string
  category: string
  snippet: string
  content: string
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [tempKey, setTempKey] = useState("")

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editSlug, setEditSlug] = useState<string | null>(null) // null means creating new
  const [form, setForm] = useState({
    title: "",
    category: "Systems",
    snippet: "",
    slug: "",
    date: "",
    content: "",
  })

  // Editor layout: 'split' or 'tabs'
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit")
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check localStorage for API Key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gwin_admin_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setTempKey(savedKey)
      setIsUnlocked(true)
    }
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/posts")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      } else {
        console.error("Failed to fetch posts")
      }
    } catch (err) {
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (tempKey.trim()) {
      localStorage.setItem("gwin_admin_api_key", tempKey.trim())
      setApiKey(tempKey.trim())
      setIsUnlocked(true)
      setSuccessMessage("API Key saved locally.")
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleLock = () => {
    localStorage.removeItem("gwin_admin_api_key")
    setApiKey("")
    setTempKey("")
    setIsUnlocked(false)
  }

  const startCreate = () => {
    setEditSlug(null)
    setForm({
      title: "",
      category: "Systems",
      snippet: "",
      slug: "",
      date: "",
      content: "",
    })
    setIsEditing(true)
    setErrorMessage(null)
  }

  const startEdit = (post: BlogPost) => {
    setEditSlug(post.slug)
    setForm({
      title: post.title,
      category: post.category,
      snippet: post.snippet,
      slug: post.slug,
      date: post.date,
      content: post.content,
    })
    setIsEditing(true)
    setErrorMessage(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setActionLoading(true)

    const isNew = editSlug === null
    const url = isNew ? "/api/posts" : `/api/posts/${editSlug}`
    const method = isNew ? "POST" : "PUT"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage(
          isNew
            ? "Blog post created successfully!"
            : "Blog post updated successfully!"
        )
        setIsEditing(false)
        fetchPosts()
        setTimeout(() => setSuccessMessage(null), 4000)
      } else {
        setErrorMessage(
          data.error || "An error occurred while saving the post."
        )
      }
    } catch (err: any) {
      setErrorMessage("Network error: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage("Blog post deleted successfully.")
        fetchPosts()
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setErrorMessage(data.error || "Failed to delete post.")
      }
    } catch (err: any) {
      setErrorMessage("Network error: " + err.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground transition-colors duration-300 selection:bg-foreground selection:text-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/40 bg-muted/10 px-6 py-12">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-3xl font-light tracking-tighter sm:text-4xl">
              <IconSparkles className="size-6 animate-pulse text-yellow-500" />
              Blog Dashboard
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Manage your engineering articles, write system logs, or publish
              updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-foreground/30"
            >
              <IconEye className="size-4" />
              View Public Blog
            </Link>

            {isUnlocked && (
              <button
                onClick={handleLock}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/5"
              >
                <IconLock className="size-4" />
                Lock Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6">
        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="animate-fade-in mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-xs leading-relaxed text-red-500">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="animate-fade-in mb-6 rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-xs leading-relaxed text-green-500">
            {successMessage}
          </div>
        )}

        {/* Lock Screen */}
        {!isUnlocked ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-card/40 p-8 text-center shadow-2xl backdrop-blur-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconLock className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Authorization Required
                </h2>
                <p className="text-xs text-muted-foreground">
                  Please provide your API key (defined in environment variables
                  as ADMIN_API_KEY) to access publishing and editing functions.
                </p>
              </div>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter your ADMIN_API_KEY"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-center font-mono text-sm transition-all focus:ring-1 focus:ring-foreground focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-foreground py-2.5 text-xs font-bold tracking-widest text-background uppercase transition-opacity hover:opacity-90"
                >
                  Unlock Manager
                </button>
              </form>
            </div>
          </div>
        ) : isEditing ? (
          /* Editor Mode */
          <div className="flex flex-1 flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconArrowLeft className="size-4" />
                Back to List
              </button>

              <div className="font-mono text-xs text-muted-foreground">
                {editSlug ? `Editing: ${editSlug}` : "New Blog Post"}
              </div>
            </div>

            <form
              onSubmit={handleSave}
              className="grid flex-1 grid-cols-1 items-stretch gap-8 lg:grid-cols-12"
            >
              {/* Form Input fields */}
              <div className="flex flex-col space-y-5 lg:col-span-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g., Implementing a Custom VM in Go"
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-2 text-sm transition-colors focus:border-foreground/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full appearance-none rounded-lg border border-border/80 bg-background px-4 py-2.5 text-sm transition-colors focus:border-foreground/50 focus:outline-none"
                    >
                      <option value="Systems">Systems</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Full-Stack">Full-Stack</option>
                      <option value="DevOps">DevOps</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      <span>Slug (Optional)</span>
                      <span className="text-[9px] font-normal text-muted-foreground lowercase">
                        Auto-generated if empty
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: e.target.value })
                      }
                      placeholder="e.g. monkey-vm-compiler"
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-2 font-mono text-sm transition-colors focus:border-foreground/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      <span>Date (Optional)</span>
                      <span className="text-[9px] font-normal text-muted-foreground lowercase">
                        Current date if empty
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      placeholder="e.g., June 4, 2026"
                      className="w-full rounded-lg border border-border/80 bg-background px-4 py-2 text-sm transition-colors focus:border-foreground/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    <span>Snippet / Brief Excerpt</span>
                    <span className="text-[9px] font-normal text-muted-foreground lowercase">
                      Used on listing card
                    </span>
                  </label>
                  <textarea
                    value={form.snippet}
                    onChange={(e) =>
                      setForm({ ...form, snippet: e.target.value })
                    }
                    placeholder="Provide a short 1-2 sentence description summarizing this post..."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border/80 bg-background px-4 py-2 text-xs leading-relaxed transition-colors focus:border-foreground/50 focus:outline-none"
                  />
                </div>

                {/* Content Editor area */}
                <div className="flex min-h-[400px] flex-1 flex-col space-y-1.5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Markdown Content
                    </label>

                    {/* View switcher for smaller screens */}
                    <div className="flex items-center rounded-md border border-border/40 bg-muted/60 p-0.5 lg:hidden">
                      <button
                        type="button"
                        onClick={() => setEditorTab("edit")}
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          editorTab === "edit"
                            ? "bg-background text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab("preview")}
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          editorTab === "preview"
                            ? "bg-background text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  <textarea
                    required
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder="Write your article in Markdown syntax... Use ## for headings, ```lang for code blocks, and | for tables."
                    className={`w-full flex-1 resize-y rounded-lg border border-border/80 bg-background p-4 font-mono text-xs leading-relaxed transition-colors focus:border-foreground/50 focus:outline-none ${
                      editorTab === "preview" ? "hidden lg:block" : "block"
                    }`}
                  />
                </div>

                {/* Submit action */}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-3 text-xs font-bold tracking-widest text-background uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="size-4" />
                  )}
                  {editSlug ? "Update Article" : "Publish Article"}
                </button>
              </div>

              {/* Preview Window */}
              <div
                className={`flex max-h-[85vh] flex-col space-y-4 overflow-y-auto rounded-xl border border-border/60 bg-card/25 p-6 shadow-inner backdrop-blur-sm lg:col-span-6 ${
                  editorTab === "edit" ? "hidden lg:flex" : "flex"
                }`}
              >
                <div className="flex items-center gap-2 border-b border-border/30 pb-3 text-muted-foreground">
                  <IconEye className="size-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    Real-time Render Preview
                  </span>
                </div>

                <div className="flex-1 pr-1">
                  {/* Fake header display inside preview */}
                  {form.title && (
                    <div className="mb-8 space-y-3 border-b border-border/30 pb-6">
                      <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                        <span className="rounded-full border border-border px-2 py-0.5">
                          {form.category}
                        </span>
                      </div>
                      <h1 className="text-2xl leading-tight font-light tracking-tight text-foreground md:text-3xl">
                        {form.title}
                      </h1>
                      <div className="text-[10px] text-muted-foreground">
                        {form.date ||
                          new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </div>
                    </div>
                  )}

                  {/* Render content */}
                  {form.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={form.content} />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center py-20 text-xs text-muted-foreground/60 italic">
                      Start typing inside the editor to see your rendered
                      content here...
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Listing Dashboard */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                Articles ({posts.length})
              </h2>

              <button
                onClick={startCreate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-bold tracking-widest text-background uppercase transition-opacity hover:opacity-90"
              >
                <IconPlus className="size-4" />
                Add Article
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-xs font-semibold text-muted-foreground">
                <IconLoader2 className="size-6 animate-spin text-foreground" />
                Fetching articles from database...
              </div>
            ) : posts.length === 0 ? (
              <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-dashed border-border py-20 text-center">
                <div className="text-2xl font-light">No Posts Found</div>
                <p className="text-xs text-muted-foreground">
                  Your blog database is empty. Click "Add Article" above to
                  create your first post!
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/65 font-bold tracking-wider text-muted-foreground uppercase">
                      <th className="px-6 py-4">Title</th>
                      <th className="hidden px-6 py-4 md:table-cell">
                        Category
                      </th>
                      <th className="hidden px-6 py-4 sm:table-cell">
                        Published Date
                      </th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, idx) => (
                      <tr
                        key={post.slug}
                        className={`border-b border-border/30 transition-colors last:border-0 hover:bg-muted/10`}
                      >
                        <td className="max-w-xs truncate px-6 py-4 font-semibold text-foreground md:max-w-md">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 transition-colors hover:text-primary hover:underline"
                          >
                            {post.title}
                            <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground/60" />
                          </Link>
                          <div className="mt-1 max-w-[200px] truncate font-mono text-[10px] text-muted-foreground md:hidden">
                            {post.category} &bull; {post.date}
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 md:table-cell">
                          <span className="rounded-full border border-border/80 bg-muted/30 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            {post.category}
                          </span>
                        </td>
                        <td className="hidden px-6 py-4 font-medium text-muted-foreground sm:table-cell">
                          {post.date}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => startEdit(post)}
                              title="Edit Post"
                              className="rounded-lg border border-border/40 p-2 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                            >
                              <IconEdit className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.slug)}
                              title="Delete Post"
                              className="rounded-lg border border-red-500/10 p-2 text-red-500 transition-colors hover:border-red-500/30 hover:bg-red-500/5"
                            >
                              <IconTrash className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/40 bg-muted/10 px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Joseph Godfrey. Control Room.</p>
          <p className="flex items-center gap-2">
            <span>Admin Panel</span>
            <span>&bull;</span>
            <span>Nigeria</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
