const ogImageCache = new Map<string, string | null>();

const GITHUB_REPO_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\/|$)/i;

/** Returns true when the link points to a GitHub repository. */
export function isGithubRepoLink(link: string): boolean {
  return GITHUB_REPO_RE.test(link);
}

/**
 * Resolves the social preview (Open Graph) image URL for a GitHub repository
 * by scraping the repo page's `og:image` meta tag. Memoized per repo.
 * Returns `null` when the link is not a GitHub repo URL or the image cannot be fetched.
 */
export async function resolveGithubOgImage(
  link: string,
): Promise<string | null> {
  const match = link.match(GITHUB_REPO_RE);
  if (!match) return null;

  const [, owner, repo] = match;
  const cacheKey = `${owner}/${repo}`;
  const cached = ogImageCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(`https://github.com/${owner}/${repo}`, {
      headers: { "user-agent": "lisham.dev portfolio" },
    });
    if (!res.ok) {
      ogImageCache.set(cacheKey, null);
      return null;
    }
    const html = await res.text();
    const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const url = ogMatch?.[1] ?? null;
    ogImageCache.set(cacheKey, url);
    return url;
  } catch {
    ogImageCache.set(cacheKey, null);
    return null;
  }
}
