const GITHUB_REPO_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\/|$)/i;

/** Returns true when the link points to a GitHub repository. */
export function isGithubRepoLink(link: string): boolean {
  return GITHUB_REPO_RE.test(link);
}

/** Returns the Open Graph image URL for a GitHub repository link. */
export function githubOgImageUrl(link: string): string | null {
  const match = link.match(GITHUB_REPO_RE);
  if (!match) return null;

  const [, owner, repo] = match;
  return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
}
