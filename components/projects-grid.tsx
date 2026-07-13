"use client"

import React, { ReactElement, useState } from "react"
import { Project } from "@/lib/github"
import {
  IconBrandGithub,
  IconExternalLink,
  IconSearch,
  IconStar,
  IconCode,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface ProjectsGridProps {
  initialProjects: Project[]
}

type Id = "all" | "systems" | "web" | "others"

type Tab = {
  id: Id
  label: string
}

export function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<Id>("all")

  const projects = initialProjects || []
  const filteredProjects = projects.filter((p) => {
    if (!p) return false
    // 1. Check search query
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.language &&
        p.language.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    // 2. Check tab filters
    const lang = p.language?.toLowerCase() || ""
    if (activeTab === "systems") {
      return lang === "rust" || lang === "go" || lang === "c" || lang === "c++"
    }
    if (activeTab === "web") {
      return (
        lang === "typescript" ||
        lang === "javascript" ||
        lang === "html" ||
        lang === "css"
      )
    }
    if (activeTab === "others") {
      return (
        lang !== "rust" &&
        lang !== "go" &&
        lang !== "c" &&
        lang !== "c++" &&
        lang !== "python" &&
        lang !== "typescript" &&
        lang !== "javascript" &&
        lang !== "html" &&
        lang !== "css"
      )
    }
    return true
  })

  const categories: Tab[] = [
    { id: "all", label: "All Repositories" },
    { id: "systems", label: "Systems (Rust/Go/C)" },
    { id: "web", label: "Web (React/TS)" },
    { id: "others", label: "Others" },
  ]

  return (
    <div className="space-y-8">
      {/* Filters Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-xs text-foreground outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Categories */}
        <div className="flex w-full flex-wrap gap-1 rounded-lg border border-border/50 bg-muted p-1 md:w-auto">
          {categories.map((tab: Tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 cursor-pointer rounded-md px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase select-none focus:outline-none md:flex-none transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <IconCode className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground">
            No repositories match your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.name}
              className="relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 transition-colors duration-200 hover:border-foreground/45"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-bold tracking-tight text-foreground">
                    {project.name}
                  </h4>
                  {project.stars > 0 && (
                    <div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      <IconStar className="size-3 fill-amber-400 stroke-amber-400" />
                      <span>{project.stars}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="line-clamp-3 min-h-16 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
                {/* Language Tag */}
                {project.language ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: project.languageColor || "#7b7b7b",
                      }}
                    />
                    <span>{project.language}</span>
                  </div>
                ) : (
                  <div />
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="View GitHub Repository"
                  >
                    <IconBrandGithub className="size-4.5" />
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Visit Live Deployment"
                    >
                      <IconExternalLink className="size-4.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
