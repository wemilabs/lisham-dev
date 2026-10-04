import matter from "gray-matter";
import { existsSync, mkdirSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const postsDirectory = path.join(process.cwd(), "content/blog");
const draftsDirectory = path.join(process.cwd(), "content/_drafts");

const ORDER_PREFIX = /^\d{2,}-/;
const DRAFT_SUFFIX = ".draft.md";

interface PostMetadata {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
  status?: "draft" | "published";
  postOfTheDay?: boolean;
  lastEdited?: string;
  publishDate?: string | null;
  date?: string;
}

interface PostEntry {
  filename: string;
  base: string;
  title: string;
  date: number;
}

/**
 * Strips the ordering prefix ("05-foo" -> "foo") from a slug
 * @param slug Slug or filename base
 * @returns Slug without the ordering prefix
 */
export function stripOrderPrefix(slug: string): string {
  return slug.replace(ORDER_PREFIX, "");
}

/**
 * Generates a URL-friendly slug from a title
 * @param title The title to convert to slug
 * @returns URL-friendly slug
 */
export function generateSafeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensures the drafts directory exists
 */
async function ensureDraftsDirectory(): Promise<void> {
  if (!existsSync(draftsDirectory)) {
    mkdirSync(draftsDirectory, { recursive: true });
  }
}

function toTimestamp(value: unknown): number {
  const time = new Date(String(value ?? "")).getTime();
  return Number.isNaN(time) ? 0 : time;
}

async function readPostEntries(): Promise<PostEntry[]> {
  const files = (await fs.readdir(postsDirectory)).filter((file) =>
    file.endsWith(".md"),
  );

  return Promise.all(
    files.map(async (filename) => {
      const content = await fs.readFile(
        path.join(postsDirectory, filename),
        "utf8",
      );
      const { data } = matter(content);
      return {
        filename,
        base: stripOrderPrefix(filename.replace(/\.md$/, "")),
        title: String(data.title ?? ""),
        date: toTimestamp(data.date ?? data.publishDate ?? data.lastEdited),
      };
    }),
  );
}

/**
 * Renumbers every post in content/blog so filenames are "NN-base.md",
 * ordered by the post's date (oldest first). Always recomputes from the
 * current files and frontmatter, so it stays correct no matter how a post
 * got there (created, restored, edited by hand, dropped in manually).
 * @returns List of renames applied, as { from, to } filenames
 */
export async function renumberPosts(): Promise<
  Array<{ from: string; to: string }>
> {
  const entries = await readPostEntries();

  entries.sort((a, b) => a.date - b.date || a.base.localeCompare(b.base));

  const changes: Array<{ from: string; to: string }> = [];

  // Two-phase rename: move to temp names first so reordering
  // (e.g. 01-foo -> 02-foo while 02-bar -> 01-bar) can't clobber files.
  const pending: Array<{ tmp: string; target: string }> = [];
  for (const [index, entry] of entries.entries()) {
    const target = `${String(index + 1).padStart(2, "0")}-${entry.base}.md`;
    if (entry.filename === target) continue;

    const tmp = `.renumber-${index}.tmp`;
    await fs.rename(
      path.join(postsDirectory, entry.filename),
      path.join(postsDirectory, tmp),
    );
    pending.push({ tmp, target });
    changes.push({ from: entry.filename, to: target });
  }

  for (const { tmp, target } of pending) {
    await fs.rename(
      path.join(postsDirectory, tmp),
      path.join(postsDirectory, target),
    );
  }

  return changes;
}

/**
 * Resolves a post slug ("foo" or "05-foo") to its filename in content/blog
 * @param slug Slug with or without the ordering prefix
 * @returns The matching filename (e.g. "05-foo.md")
 */
export async function resolvePostFile(slug: string): Promise<string> {
  const files = (await fs.readdir(postsDirectory)).filter((file) =>
    file.endsWith(".md"),
  );

  const exact = `${slug}.md`;
  if (files.includes(exact)) return exact;

  const matches = files.filter(
    (file) => stripOrderPrefix(file.replace(/\.md$/, "")) === slug,
  );

  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(
      `Slug "${slug}" matches multiple posts: ${matches.join(", ")}`,
    );
  }
  throw new Error(`Post "${slug}" not found`);
}

function draftBase(filenameOrSlug: string): string {
  return filenameOrSlug.endsWith(DRAFT_SUFFIX)
    ? filenameOrSlug.slice(0, -DRAFT_SUFFIX.length)
    : filenameOrSlug.replace(/\.draft$/, "");
}

/**
 * Resolves a draft slug to its filename in content/_drafts
 * @param slug Draft slug, with or without the .draft suffix
 * @returns The matching filename (e.g. "foo.draft.md")
 */
export async function resolveDraftFile(slug: string): Promise<string> {
  const base = draftBase(slug);
  const filename = `${base}${DRAFT_SUFFIX}`;

  if (!existsSync(path.join(draftsDirectory, filename))) {
    throw new Error(`Draft "${base}" not found`);
  }
  return filename;
}

/**
 * Lists all published posts, newest first
 * @returns Posts with filename slug (numbered), base slug, title and date
 */
export async function listPosts(): Promise<
  Array<{ slug: string; baseSlug: string; title: string; date: Date }>
> {
  const entries = await readPostEntries();

  return entries
    .map((entry) => ({
      slug: entry.filename.replace(/\.md$/, ""),
      baseSlug: entry.base,
      title: entry.title,
      date: new Date(entry.date),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Creates a new blog post and renumbers the directory
 * @param metadata Post metadata (title, description, tags)
 * @param boilerplateContent Initial content of the post
 * @returns The generated slug, including its ordering prefix
 */
export async function createNewPost(
  metadata: PostMetadata,
  boilerplateContent: string = "",
): Promise<string> {
  const slug = generateSafeSlug(metadata.title);

  const taken = (await readPostEntries()).some((post) => post.base === slug);
  if (taken) {
    throw new Error(`A post with slug "${slug}" already exists`);
  }

  const frontmatter = {
    ...metadata,
    date: new Date().toISOString(),
  };
  const fileContent = matter.stringify(boilerplateContent, frontmatter);

  if (!existsSync(postsDirectory)) {
    mkdirSync(postsDirectory, { recursive: true });
  }

  // Write unnumbered, then let renumberPosts place it by date
  await fs.writeFile(
    path.join(postsDirectory, `${slug}.md`),
    fileContent,
    "utf8",
  );
  await renumberPosts();

  return (await resolvePostFile(slug)).replace(/\.md$/, "");
}

/**
 * Permanently deletes a post, then renumbers the directory.
 * Previously committed posts remain recoverable from git history.
 * @param slug Slug with or without the ordering prefix
 */
export async function deletePost(slug: string): Promise<void> {
  const filename = await resolvePostFile(slug);
  await fs.unlink(path.join(postsDirectory, filename));
  await renumberPosts();
}

/**
 * Creates a new draft post (drafts are unordered scratch files
 * and never carry an ordering prefix)
 * @param title The title of the draft
 * @param metadata Additional metadata (description, tags)
 * @param content Initial content
 * @returns The generated slug for the draft
 */
export async function createDraft(
  title: string,
  metadata: Partial<PostMetadata> = {},
  content: string = "",
): Promise<string> {
  const slug = generateSafeSlug(title);

  await ensureDraftsDirectory();

  const filePath = path.join(draftsDirectory, `${slug}${DRAFT_SUFFIX}`);
  if (existsSync(filePath)) {
    throw new Error(`A draft with slug "${slug}" already exists`);
  }

  const frontmatter: PostMetadata = {
    title,
    description: metadata.description || "",
    tags: metadata.tags || ["draft"],
    status: "draft",
    ...(metadata.postOfTheDay ? { postOfTheDay: true } : {}),
    lastEdited: new Date().toISOString(),
    publishDate: null,
  };

  await fs.writeFile(filePath, matter.stringify(content, frontmatter), "utf8");

  return slug;
}

/**
 * Lists all draft posts
 * @returns Array of draft posts with metadata
 */
export async function listDrafts(): Promise<
  Array<{
    slug: string;
    title: string;
    description: string;
    lastEdited: Date;
  }>
> {
  await ensureDraftsDirectory();

  const files = await fs.readdir(draftsDirectory);

  const drafts = await Promise.all(
    files
      .filter((file) => file.endsWith(DRAFT_SUFFIX))
      .map(async (file) => {
        const content = await fs.readFile(
          path.join(draftsDirectory, file),
          "utf8",
        );
        const { data } = matter(content);
        return {
          slug: draftBase(file),
          title: data.title,
          description: data.description,
          lastEdited: new Date(data.lastEdited),
        };
      }),
  );

  return drafts.sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime());
}

/**
 * Publishes a draft into content/blog and renumbers the directory
 * @param slug The draft's slug
 * @returns The published post's slug, including its ordering prefix
 */
export async function publishDraft(slug: string): Promise<string> {
  const draftFile = await resolveDraftFile(slug);
  const base = draftBase(draftFile);

  const taken = (await readPostEntries()).some((post) => post.base === base);
  if (taken) {
    throw new Error(`A published post with slug "${base}" already exists`);
  }

  const draftContent = await fs.readFile(
    path.join(draftsDirectory, draftFile),
    "utf8",
  );
  const { data: metadata, content } = matter(draftContent);

  const now = new Date().toISOString();
  const publishMetadata: PostMetadata = {
    ...(metadata as PostMetadata),
    status: "published",
    publishDate: now,
    lastEdited: now,
    date: now,
  };

  await fs.writeFile(
    path.join(postsDirectory, `${base}.md`),
    matter.stringify(content, publishMetadata),
    "utf8",
  );
  await fs.unlink(path.join(draftsDirectory, draftFile));

  await renumberPosts();

  return (await resolvePostFile(base)).replace(/\.md$/, "");
}
