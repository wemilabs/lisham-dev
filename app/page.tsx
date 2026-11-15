import Hero from "@/components/home/hero";
import { ProjectGrid } from "@/components/projects/project-grid";
import { type Project, projects } from "@/lib/data";
import { githubOgImageUrl, isGithubRepoLink } from "@/lib/github";

function enrichProjectsWithGithubImages(projects: Project[]): Project[] {
  return projects.map((project) => {
    if (project.image || !project.link || !isGithubRepoLink(project.link)) {
      return project;
    }
    const ogImage = githubOgImageUrl(project.link);
    return ogImage ? { ...project, image: ogImage } : project;
  });
}

export default function Home() {
  const enrichedProjects = enrichProjectsWithGithubImages(projects);
  return (
    <div className="relative overflow-hidden">
      <Hero />
      <ProjectGrid projects={enrichedProjects} />
    </div>
  );
}
