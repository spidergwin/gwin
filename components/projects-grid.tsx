"use client";

import React, { useState } from "react";
import { Project } from "@/lib/github";
import { IconBrandGithub, IconExternalLink, IconSearch, IconStar, IconCode } from "@tabler/icons-react";

interface ProjectsGridProps {
  initialProjects: Project[];
}

export function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "systems" | "web" | "others">("all");

  const filteredProjects = initialProjects.filter((p) => {
    // 1. Check search query
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.language && p.language.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Check tab filters
    const lang = p.language?.toLowerCase() || "";
    if (activeTab === "systems") {
      return lang === "rust" || lang === "go" || lang === "c" || lang === "c++" || lang === "assembly";
    }
    if (activeTab === "web") {
      return lang === "typescript" || lang === "javascript" || lang === "html" || lang === "css";
    }
    if (activeTab === "others") {
      return (
        lang !== "rust" &&
        lang !== "go" &&
        lang !== "c" &&
        lang !== "c++" &&
        lang !== "assembly" &&
        lang !== "typescript" &&
        lang !== "javascript" &&
        lang !== "html" &&
        lang !== "css"
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-xs outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 p-1 bg-muted border border-border/50 rounded-lg w-full md:w-auto">
          {[
            { id: "all", label: "All Repositories" },
            { id: "systems", label: "Systems (Rust/Go/C)" },
            { id: "web", label: "Web (React/TS)" },
            { id: "others", label: "Others" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none text-xs font-semibold px-4 py-1.5 rounded-md uppercase tracking-wider transition-all select-none focus:outline-none cursor-pointer ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
          <IconCode className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">No repositories match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.name}
              className="group flex flex-col justify-between p-6 border border-border/80 bg-card rounded-xl transition-all duration-300 hover:border-foreground/40 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {project.name}
                  </h4>
                  {project.stars > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded">
                      <IconStar className="size-3 fill-amber-400 stroke-amber-400" />
                      <span>{project.stars}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed min-h-[4rem]">
                  {project.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                {/* Language Tag */}
                {project.language ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: project.languageColor || "#7b7b7b" }}
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
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="View GitHub Repository"
                  >
                    <IconBrandGithub className="size-4.5" />
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
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
  );
}
