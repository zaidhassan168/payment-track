import { getProjects } from "@/app/services/projects";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  // Fetch projects on the server
  const projects = await getProjects();

  // Pass fetched data to the client component
  return <ProjectsPageClient projects={projects} />;
}
