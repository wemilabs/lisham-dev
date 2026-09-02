import Hero from "@/components/home/hero";
import { ProjectGrid } from "@/components/projects/project-grid";
import { type Project, projects } from "@/lib/data";
import { isGithubRepoLink, resolveGithubOgImage } from "@/lib/github";

async function enrichProjectsWithGithubImages(
  projects: Project[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(async (project) => {
      if (project.image || !project.link || !isGithubRepoLink(project.link)) {
        return project;
      }
      const ogImage = await resolveGithubOgImage(project.link);
      return ogImage ? { ...project, image: ogImage } : project;
    }),
  );
}

export default async function Home() {
  const enrichedProjects = await enrichProjectsWithGithubImages(projects);

  return (
    <div className="relative overflow-hidden">
      <Hero />
      <ProjectGrid projects={enrichedProjects} />
    </div>
  );
}
