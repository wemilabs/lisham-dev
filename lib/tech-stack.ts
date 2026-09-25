import type { Icons } from "@/components/icons";

export type Tech = {
  icon: keyof typeof Icons;
  name: string;
  description: string;
};

export const centerTech: Tech = {
  icon: "devin",
  name: "Devin: The autonomous software engineer",
  description:
    "Devin is an AI coding agent and software engineer that helps developers build better software faster. Parallel cloud agents for serious engineering teams.",
};

export const techStack: Tech[] = [
  {
    icon: "betterAuth",
    name: "Better Auth",
    description: "Framework-agnostic authentication library for TypeScript.",
  },
  {
    icon: "drizzle",
    name: "Drizzle ORM",
    description: "Lightweight, type-safe ORM with a SQL-like query builder.",
  },
  {
    icon: "pnpm",
    name: "pnpm",
    description: "Fast, disk-efficient package manager for JavaScript.",
  },
  {
    icon: "neon",
    name: "Neon",
    description: "Serverless Postgres with branching and autoscaling.",
  },
  {
    icon: "nextjs",
    name: "Next.js",
    description: "React framework for full-stack apps with Server Components.",
  },
  {
    icon: "vercel",
    name: "Vercel",
    description: "Cloud platform that builds, deploys and hosts this site.",
  },
  {
    icon: "postgresql",
    name: "PostgreSQL",
    description: "Open-source relational database.",
  },
  {
    icon: "typescript",
    name: "TypeScript",
    description: "JavaScript with static types for safer, scalable code.",
  },
  {
    icon: "react",
    name: "React",
    description: "Library for building component-driven user interfaces.",
  },
  {
    icon: "tailwindcss",
    name: "Tailwind CSS",
    description: "Utility-first CSS framework, styled from class names.",
  },
  {
    icon: "zod",
    name: "Zod",
    description: "TypeScript-first schema validation with type inference.",
  },
  {
    icon: "polar",
    name: "Polar",
    description: "Payments and billing infrastructure for developers.",
  },
  {
    icon: "shadcn",
    name: "shadcn/ui",
    description: "Accessible, customizable components you own the code of.",
  },
  {
    icon: "resend",
    name: "Resend",
    description: "Email API for sending transactional emails.",
  },
];
