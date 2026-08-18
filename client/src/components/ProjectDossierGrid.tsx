/* NOIACORE dossier grid: evidence-first cards, filterable taxonomy, progressive disclosure. */
import { ArrowUpRight, ChevronRight, Search } from "lucide-react";

type Project = { number: string; category: string; title: string; description: string; tags: string[]; tone: string; image: string; href: string; status: string; signal: string; detail: string };

export function ProjectDossierGrid({ projects, filter, onFilter, onOpen }: { projects: Project[]; filter: string; onFilter: (value: string) => void; onOpen: (project: Project) => void }) {
  const categories = ["ALL", ...Array.from(new Set(projects.map((project) => project.category.split(" / ")[1])))];
  const visible = filter === "ALL" ? projects : projects.filter((project) => project.category.includes(filter));
  return <><div className="filter-rail" role="toolbar" aria-label="Filtrar expedientes"><Search size={14}/>{categories.map((category) => <button key={category} className={filter === category ? "is-active" : ""} onClick={() => onFilter(category)}>{category}</button>)}</div><div className="project-list">{visible.map((project) => <article className={`project-card tone-${project.tone}`} key={project.number}><button className="project-visual" onClick={() => onOpen(project)} aria-label={`Abrir ${project.title}`}><img src={project.image} alt=""/><span className="project-number">{project.number}</span><span className="project-open">ABRIR <ArrowUpRight size={15}/></span><span className="project-signal">{project.signal}</span></button><div className="project-copy"><div className="project-meta"><span>{project.category}</span><span>{project.status}</span></div><h2>{project.title}</h2><p>{project.description}</p><div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="project-link" onClick={() => onOpen(project)}>Abrir expediente <ChevronRight size={16}/></button></div></article>)}</div></>;
}
