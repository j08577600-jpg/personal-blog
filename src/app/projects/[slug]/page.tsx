import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/lib/projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "项目未找到" };
  }

  const url = `${siteConfig.siteUrl}/projects/${project.slug}`;
  const displayTags = (project.tech && project.tech.length > 0) ? project.tech : project.tags;

  return {
    title: project.title,
    description: project.excerpt,
    authors: [{ name: siteConfig.author.name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description: project.excerpt,
      publishedTime: project.date,
      authors: [siteConfig.author.name],
      tags: displayTags,
    },
    twitter: {
      card: "summary",
      title: project.title,
      description: project.excerpt,
    },
  };
}

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1 -mt-0.5"
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
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block mr-1.5 -mt-0.5"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-1.5 -mt-0.5"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const displayTags = (project.tech && project.tech.length > 0) ? project.tech : project.tags;

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/projects"
        className="mb-8 inline-block text-sm text-accent hover:underline transition-colors duration-150"
      >
        ← 返回项目列表
      </Link>

      {/* Project header */}
      <div className="mb-6">
        {/* Status badge */}
        {project.status && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium mb-4 ${PROJECT_STATUS_COLORS[project.status]}`}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {project.title}
        </h1>
        <div className="mt-5 mb-8 h-px bg-border" />
      </div>

      {/* Tech tags (above date) */}
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

      {/* Date */}
      <div className="mb-10 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>{project.date}</span>
        <span>·</span>
        <span>{project.readingTime} 分钟阅读</span>
      </div>

      {/* External links */}
      {project.links && (project.links.github || project.links.live || project.links.demo) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent transition-colors duration-150"
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
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent transition-colors duration-150"
            >
              <LiveIcon />
              在线访问
              <ExternalLinkIcon />
            </a>
          )}
          {project.links.demo && !project.links.live && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent transition-colors duration-150"
            >
              Demo
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      )}

      {/* MDX body */}
      <div className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:text-text-primary
        prose-p:text-text-secondary
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-accent prose-code:bg-accent-subtle prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:rounded-xl prose-pre:p-5
        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent-subtle/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic
        prose-strong:text-text-primary
        prose-li:text-text-secondary
        prose-hr:border-border
        prose-img:rounded-xl
        prose-table:text-text-secondary
        prose-th:text-text-primary
        prose-em:text-text-secondary
      ">
        <MDXRemote source={project.content} />
      </div>
    </article>
  );
}
