import { profileConfig } from "./config"

export interface Project {
  name: string
  description: string
  githubUrl: string
  liveUrl?: string
  stars: number
  language?: string
  languageColor?: string
}

export interface GitHubProfile {
  name: string
  bio: string
  location: string
  company: string
  websiteUrl: string
}

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "rusty-kernel",
    description:
      "A toy monolithic kernel written in Rust targeting x86_64, demonstrating systems programming concepts like paging, memory management, and process scheduling.",
    githubUrl: "https://github.com/spidergwin/rusty-kernel",
    liveUrl: "https://rusty-kernel.vercel.app",
    stars: 12,
    language: "Rust",
    languageColor: "#deeaf7",
  },
  {
    name: "sys-mon",
    description:
      "A lightweight system monitoring dashboard written in Go and Next.js, reading from Linux procfs and streaming stats via WebSockets.",
    githubUrl: "https://github.com/spidergwin/sys-mon",
    liveUrl: "https://sys-mon.vercel.app",
    stars: 8,
    language: "Go",
    languageColor: "#00ADD8",
  },
  {
    name: "antigravity-ui",
    description:
      "A highly accessible design system and component library built with TailwindCSS and Radix Primitives for modern React applications.",
    githubUrl: "https://github.com/spidergwin/antigravity-ui",
    liveUrl: "https://antigravity-ui.vercel.app",
    stars: 25,
    language: "TypeScript",
    languageColor: "#3178c6",
  },
  {
    name: "compiler-in-go",
    description:
      "An implementation of a compiler and interpreter for the Monkey programming language, following Writing An Interpreter/Compiler In Go.",
    githubUrl: "https://github.com/spidergwin/compiler-in-go",
    stars: 15,
    language: "Go",
    languageColor: "#00ADD8",
  },
]

// Cache the GraphQL response to avoid double fetching for profile and projects
let cachedGraphQLResult: {
  profile: GitHubProfile
  projects: Project[]
} | null = null
let cachedGraphQLTime = 0

async function fetchGraphQL(
  username: string
): Promise<{ profile: GitHubProfile; projects: Project[] } | null> {
  const now = Date.now()
  // Cache in-memory for 10 seconds to deduplicate parallel calls during page render
  if (cachedGraphQLResult && now - cachedGraphQLTime < 10000) {
    return cachedGraphQLResult
  }

  const token = process.env.GITHUB_API_TOKEN
  if (!token) {
    console.warn(
      "[GitHub GraphQL] GITHUB_API_TOKEN is not set. Skipping GraphQL query."
    )
    return null
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        name
        bio
        company
        location
        websiteUrl
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            ... on Repository {
              name
              description
              url
              homepageUrl
              stargazerCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
        "User-Agent": "gwin-portfolio",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.warn(
        `[GitHub GraphQL] API error: ${res.status} ${res.statusText}`
      )
      return null
    }

    const json = await res.json()
    if (json.errors) {
      console.warn("[GitHub GraphQL] Query errors:", json.errors)
      return null
    }

    const user = json.data?.user
    if (!user) {
      return null
    }

    const profile: GitHubProfile = {
      name: user.name || profileConfig.name,
      bio: user.bio || "Software Engineer",
      location: user.location || "Nigeria",
      company: user.company || "Freelance",
      websiteUrl: user.websiteUrl || profileConfig.portfolioUrl,
    }

    const projects: Project[] = (user.pinnedItems?.nodes || [])
      .filter((node: unknown) => node !== null)
      .map((node: any) => ({
        name: node.name,
        description: node.description || "No description provided.",
        githubUrl: node.url,
        liveUrl: node.homepageUrl || undefined,
        stars: node.stargazerCount || 0,
        language: node.primaryLanguage?.name || undefined,
        languageColor: node.primaryLanguage?.color || undefined,
      }))

    cachedGraphQLResult = { profile, projects }
    cachedGraphQLTime = now

    return cachedGraphQLResult
  } catch (error) {
    console.error("[GitHub GraphQL] Fetch exception:", error)
    return null
  }
}

// Fetch user profile from REST API as fallback
async function fetchProfileRest(
  username: string
): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "gwin-portfolio",
        ...(process.env.GITHUB_API_TOKEN
          ? { Authorization: `token ${process.env.GITHUB_API_TOKEN}` }
          : {}),
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.warn(`[GitHub REST Profile] API error: ${res.status}`)
      return null
    }

    const user = await res.json()
    return {
      name: user.name || profileConfig.name,
      bio: user.bio || "Software Engineer",
      location: user.location || "Nigeria",
      company: user.company || "Freelance",
      websiteUrl: user.blog || profileConfig.portfolioUrl,
    }
  } catch (error) {
    console.error("[GitHub REST Profile] Fetch exception:", error)
    return null
  }
}

// Fetch repos from REST API as fallback
async function fetchReposRest(username: string): Promise<Project[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=15`,
      {
        headers: {
          "User-Agent": "gwin-portfolio",
          ...(process.env.GITHUB_API_TOKEN
            ? { Authorization: `token ${process.env.GITHUB_API_TOKEN}` }
            : {}),
        },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      console.warn(`[GitHub REST Repos] API error: ${res.status}`)
      return null
    }

    const data = await res.json()
    if (!Array.isArray(data)) return null

    const langColors: Record<string, string> = {
      Rust: "#deeaf7",
      Go: "#00ADD8",
      TypeScript: "#3178c6",
      JavaScript: "#f1e05a",
      Python: "#3572A5",
      C: "#555555",
      Solidity: "#AA6746",
      Java: "#b07219",
    }

    return data
      .filter((repo: any) => !repo.fork)
      .slice(0, 6)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description || "No description provided.",
        githubUrl: repo.html_url,
        liveUrl: repo.homepage || undefined,
        stars: repo.stargazers_count || 0,
        language: repo.language || undefined,
        languageColor: repo.language
          ? langColors[repo.language] || "#7b7b7b"
          : undefined,
      }))
  } catch (error) {
    console.error("[GitHub REST Repos] Fetch exception:", error)
    return null
  }
}

export async function getPinnedProjects(username: string): Promise<Project[]> {
  // Try GraphQL first
  const gqlData = await fetchGraphQL(username)
  if (gqlData && gqlData.projects.length > 0) {
    return gqlData.projects
  }

  // Fallback to REST API
  const restProjects = await fetchReposRest(username)
  if (restProjects && restProjects.length > 0) {
    return restProjects
  }

  return FALLBACK_PROJECTS
}

export async function getGitHubProfile(
  username: string
): Promise<GitHubProfile> {
  // Try GraphQL first
  const gqlData = await fetchGraphQL(username)
  if (gqlData) {
    return gqlData.profile
  }

  // Fallback to REST API
  const restProfile = await fetchProfileRest(username)
  if (restProfile) {
    return restProfile
  }

  // Fallback to local config
  return {
    name: profileConfig.name,
    bio: "Software Engineer specializing in Systems, Backend, Fullstack, AI, Mobile, and Web3 development.",
    location: "Nigeria",
    company: "Freelance",
    websiteUrl: profileConfig.portfolioUrl,
  }
}
