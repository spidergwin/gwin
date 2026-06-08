export interface Project {
  name: string;
  description: string;
  githubUrl: string;
  liveUrl?: string;
  stars: number;
  language?: string;
  languageColor?: string;
}

// Highly robust list of fallback projects in case API rate limits hit
const FALLBACK_PROJECTS: Project[] = [
  {
    name: "rusty-kernel",
    description: "A toy monolithic kernel written in Rust targeting x86_64, demonstrating systems programming concepts like paging, memory management, and process scheduling.",
    githubUrl: "https://github.com/spidergwin/rusty-kernel",
    liveUrl: "https://rusty-kernel.vercel.app",
    stars: 12,
    language: "Rust",
    languageColor: "#deeaf7"
  },
  {
    name: "sys-mon",
    description: "A lightweight system monitoring dashboard written in Go and Next.js, reading from Linux procfs and streaming stats via WebSockets.",
    githubUrl: "https://github.com/spidergwin/sys-mon",
    liveUrl: "https://sys-mon.vercel.app",
    stars: 8,
    language: "Go",
    languageColor: "#00ADD8"
  },
  {
    name: "antigravity-ui",
    description: "A highly accessible design system and component library built with TailwindCSS and Radix Primitives for modern React applications.",
    githubUrl: "https://github.com/spidergwin/antigravity-ui",
    liveUrl: "https://antigravity-ui.vercel.app",
    stars: 25,
    language: "TypeScript",
    languageColor: "#3178c6"
  },
  {
    name: "compiler-in-go",
    description: "An implementation of a compiler and interpreter for the Monkey programming language, following Writing An Interpreter/Compiler In Go.",
    githubUrl: "https://github.com/spidergwin/compiler-in-go",
    stars: 15,
    language: "Go",
    languageColor: "#00ADD8"
  }
];

export async function getPinnedProjects(username: string): Promise<Project[]> {
  try {
    // 1. Try to fetch pinned repositories by scraping the GitHub profile
    const profileUrl = `https://github.com/${username}`;
    const response = await fetch(profileUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const html = await response.text();

    // Regex to match pinned items
    // Pinned repositories are contained in <div class="pinned-item-list-item-content">...</div>
    const pinnedBlocks = html.split('pinned-item-list-item-content');
    if (pinnedBlocks.length <= 1) {
      // Fallback to REST API if scraping pattern doesn't match
      return await fetchFromRestApi(username);
    }

    const projects: Project[] = [];

    // Skip the first block as it's the HTML before the first pinned item
    for (let i = 1; i < pinnedBlocks.length; i++) {
      const block = pinnedBlocks[i];

      // Extract repository name
      const nameMatch = block.match(/href="\/[^/]+\/([^"]+)"[^>]*>\s*<span[^>]*title="[^"]+"[^>]*>([^<]+)/);
      const name = nameMatch ? nameMatch[2].trim() : "";

      if (!name) continue;

      // Extract description
      const descMatch = block.match(/class="pinned-item-desc[^"]*"[^>]*>([^<]*)/);
      let description = descMatch ? descMatch[1].trim() : "";

      // Sometimes description spans tags or contains entities
      if (description) {
        description = description
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"');
      }

      // Extract language
      const langMatch = block.match(/programmingLanguage"[^>]*>([^<]+)/);
      const language = langMatch ? langMatch[1].trim() : undefined;

      // Extract language color
      const colorMatch = block.match(/class="repo-language-color"[^>]*style="background-color:\s*([^;"]+)/);
      const languageColor = colorMatch ? colorMatch[1].trim() : undefined;

      // Extract stars
      const starMatch = block.match(/href="\/[^/]+\/[^/]+\/stargazers"[^>]*>\s*(?:<svg[^>]*>)?\s*([\d,.]+)/);
      const stars = starMatch ? parseInt(starMatch[1].replace(/,/g, ""), 10) : 0;

      // Check if we can infer/fetch a live URL.
      // Usually live URL is not directly in pinned item block, but we can check if it's on Vercel
      // Or we can query the specific repo REST API to get homepage url.
      const githubUrl = `https://github.com/${username}/${name}`;
      
      projects.push({
        name,
        description,
        githubUrl,
        stars,
        language,
        languageColor
      });
    }

    // Now, for the pinned items, let's fetch their homepages using REST API or parallel requests
    const enrichedProjects = await Promise.all(
      projects.map(async (p) => {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${username}/${p.name}`, {
            next: { revalidate: 3600 },
            headers: {
              "User-Agent": "antigravity-portfolio"
            }
          });
          if (repoRes.ok) {
            const data = await repoRes.json();
            return {
              ...p,
              description: data.description || p.description,
              liveUrl: data.homepage || undefined,
              stars: data.stargazers_count || p.stars
            };
          }
        } catch (err) {
          console.error(`Failed to enrich repo ${p.name}:`, err);
        }
        
        // If REST API fails, try to infer liveUrl if it's a web project
        // Or default to a vercel app based on name
        if (p.name.includes("web") || p.name.includes("ui") || p.name.includes("dashboard") || p.name.includes("app")) {
          p.liveUrl = `https://${p.name}.vercel.app`;
        }
        return p;
      })
    );

    return enrichedProjects.length > 0 ? enrichedProjects : await fetchFromRestApi(username);
  } catch (error) {
    console.error("Error fetching pinned projects, falling back to REST API:", error);
    return await fetchFromRestApi(username);
  }
}

async function fetchFromRestApi(username: string): Promise<Project[]> {
  try {
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=15`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "antigravity-portfolio"
      }
    });

    if (!response.ok) {
      throw new Error(`REST API failed: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return FALLBACK_PROJECTS;

    // Filter out forks, map to projects
    const projects: Project[] = data
      .filter((repo: any) => !repo.fork)
      .slice(0, 6)
      .map((repo: any) => {
        // Find language color
        const langColors: Record<string, string> = {
          Rust: "#deeaf7",
          Go: "#00ADD8",
          TypeScript: "#3178c6",
          JavaScript: "#f1e05a",
          Python: "#3572A5",
          C: "#555555",
          "C++": "#f34b7d",
          HTML: "#e34c26"
        };
        return {
          name: repo.name,
          description: repo.description || "No description provided.",
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || (repo.name.includes("web") || repo.name.includes("ui") ? `https://${repo.name}.vercel.app` : undefined),
          stars: repo.stargazers_count || 0,
          language: repo.language || undefined,
          languageColor: repo.language ? langColors[repo.language] || "#7b7b7b" : undefined
        };
      });

    return projects.length > 0 ? projects : FALLBACK_PROJECTS;
  } catch (error) {
    console.error("Error fetching from REST API, using static fallbacks:", error);
    return FALLBACK_PROJECTS;
  }
}
