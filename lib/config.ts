export interface ContactLink {
  platform: string;
  url: string;
  label: string;
  iconName: string;
}

export interface SkillLanguage {
  name: string;
  level?: string;
}

export interface Specialization {
  title: string;
  description: string;
  skills: string[];
}

export interface ProfileConfig {
  name: string;
  username: string;
  email: string;
  experienceYears: string;
  startupName: string;
  startupUrl: string;
  contactLinks: ContactLink[];
  languages: SkillLanguage[];
  specializations: Specialization[];
}

export const profileConfig: ProfileConfig = {
  name: "Joseph Godfrey",
  username: "spidergwin",
  email: "gwinofficial1@gmail.com",
  experienceYears: "5+",
  startupName: "Last Minutes",
  startupUrl: "https://last-minutes.vercel.app",
  
  // Easily editable contact links. Users can add/modify links here
  contactLinks: [
    {
      platform: "WhatsApp",
      url: "https://wa.me/2349035653155", // Replace with preferred WhatsApp link
      label: "WhatsApp",
      iconName: "whatsapp",
    },
    {
      platform: "Telegram",
      url: "https://t.me/spidergwin", // Replace with preferred Telegram link
      label: "Telegram",
      iconName: "telegram",
    },
    {
      platform: "Email",
      url: "mailto:gwinofficial1@gmail.com",
      label: "Email",
      iconName: "email",
    },
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/gwinofficial",
      label: "LinkedIn",
      iconName: "linkedin",
    },
    {
      platform: "GitHub",
      url: "https://github.com/spidergwin",
      label: "GitHub",
      iconName: "github",
    },
  ],

  // Specific languages clarified by the user
  languages: [
    { name: "JavaScript (TypeScript)" },
    { name: "Go" },
    { name: "Rust" },
    { name: "C" },
    { name: "Python" },
    { name: "Web3 (Solidity)" },
    { name: "Java" },
  ],

  // Specializations with detailed technical descriptions matching the user prompt
  specializations: [
    {
      title: "Frontend Development",
      description: "Crafting highly performant, responsive, and beautifully animated user interfaces using React, Next.js, and modern CSS/Tailwind.",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "CSS Animations"],
    },
    {
      title: "Backend Development",
      description: "Architecting scalable backend architectures, APIs, and microservices in Go, Rust, TypeScript, and Python.",
      skills: ["Go", "Rust", "TypeScript", "Python", "PostgreSQL", "Redis", "WebSockets"],
    },
    {
      title: "Full-Stack Development",
      description: "Developing robust, modern full-stack web applications using Next.js and TanStack Start for optimal server/client coherence.",
      skills: ["Next.js", "TanStack Start", "Prisma", "TypeScript", "SQL"],
    },
    {
      title: "AI Development & Training",
      description: "Building, training, and fine-tuning machine learning models and deploying intelligent agentic workflows using Python.",
      skills: ["Python", "PyTorch", "Hugging Face", "LLMs", "Agentic Workflows"],
    },
    {
      title: "Mobile App Development",
      description: "Developing high-performance, responsive cross-platform mobile applications with React Native.",
      skills: ["React Native", "Expo", "TypeScript", "Mobile UI"],
    },
    {
      title: "Systems & Kernel Programming",
      description: "Writing C and Rust to develop low-level system utilities, custom monolithic kernels, page schedulers, and compilers.",
      skills: ["C", "Rust", "Go", "Compilers", "Kernel Dev"],
    },
    {
      title: "Web3 & Blockchain Development",
      description: "Authoring, testing, and deploying secure smart contracts and decentralized applications on EVM networks using Solidity.",
      skills: ["Solidity", "Web3", "Ethers.js", "Foundry", "Hardhat", "Smart Contracts"],
    },
  ],
};
