import Link from "next/link";
import type { Project } from "@/lib/projects";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
}

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1 -mt-0.5 opacity-60"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block mr-1 -mt-0.5"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-1 -mt-0.5"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const displayTags = project.tech && project.tech.length > 0 ? project.tech : project.tags;

  return (
    <article className="group rounded-xl border border-border bg-bg-surface p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-200">
      {/* Meta row: status badge + date */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {project.status && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        )}
        <span className="text-xs text-text-muted">{project.date}</span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold tracking-tight">
        <Link
          href={`/projects/${project.slug}`}
          className="text-text-primary hover:text-accent transition-colors duration-150"
        >
          {project.title}
        </Link>
      </h3>

      {/* Excerpt */}
      <p className="mb-4 text-sm leading-7 text-text-secondary">
        {project.excerpt}
      </p>

      {/* Tech tags */}
      {displayTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-accent-subtle text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* External links */}
      {project.links && (project.links.github || project.links.live || project.links.demo) && (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-text-muted hover:text-accent transition-colors duration-150"
            >
              <GitHubIcon />
              GitHub
              <ExternalLinkIcon />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-text-muted hover:text-accent transition-colors duration-150"
            >
              <LiveIcon />
              Live
              <ExternalLinkIcon />
            </a>
          )}
          {project.links.demo && !project.links.live && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-text-muted hover:text-accent transition-colors duration-150"
            >
              Demo
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
