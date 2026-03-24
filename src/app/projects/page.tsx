import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import {
  getProjects,
  PROJECT_STATUS_OPTIONS,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/projects";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export const metadata: Metadata = {
  title: "项目",
  description: "展示已完成和正在进行中的项目。",
  alternates: {
    canonical: "/projects",
  },
};

export default async function ProjectsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filterStatus = (status as ProjectStatus) || null;

  // Validate status filter
  const isValidStatus =
    filterStatus !== null &&
    PROJECT_STATUS_OPTIONS.includes(filterStatus);

  let projects = getProjects();

  // Filter by status if provided and valid
  if (isValidStatus) {
    projects = projects.filter((p) => p.status === filterStatus);
  } else {
    // Default: hide archived unless explicitly filtered
    projects = projects.filter((p) => p.status !== "archived");
  }

  // Split featured from rest
  const featured = projects.filter((p) => p.featured);
  const regular = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* Title section */}
      <div className="relative mb-12 max-w-2xl pl-5">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-text-muted">项目</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          记录构建、交付，以及更认真地做产品。
        </h1>
        {projects.length > 0 && (
          <p className="mt-3 text-sm text-text-muted">
            共 {projects.length} 个项目
          </p>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {/* "All" tab */}
        <Link
          href="/projects"
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
            !isValidStatus
              ? "bg-accent text-white"
              : "bg-bg-surface text-text-muted hover:text-accent border border-border"
          }`}
        >
          全部
        </Link>

        {PROJECT_STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/projects?status=${s}`}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              isValidStatus && filterStatus === s
                ? "bg-accent text-white"
                : "bg-bg-surface text-text-muted hover:text-accent border border-border"
            }`}
          >
            {PROJECT_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Featured section */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-text-muted">
            精选
          </h2>
          <div className="grid gap-6">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Regular project grid */}
      {regular.length > 0 && (
        <div className="grid gap-6">
          {regular.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <p className="py-12 text-center text-sm text-text-muted">
          {isValidStatus
            ? `暂无「${PROJECT_STATUS_LABELS[filterStatus as ProjectStatus]}」项目。`
            : "暂无项目，敬请期待。"}
        </p>
      )}
    </div>
  );
}
