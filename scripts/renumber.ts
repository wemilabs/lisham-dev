import { renumberPosts } from "../lib/posts";

async function main() {
  try {
    const changes = await renumberPosts();

    if (changes.length === 0) {
      console.log("✅ Posts already ordered by date");
      return;
    }

    for (const { from, to } of changes) {
      console.log(`📝 ${from} -> ${to}`);
    }
    console.log(`✅ Renumbered ${changes.length} post(s)`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Failed to renumber posts:", error.message);
    } else {
      console.error("❌ An unexpected error occurred");
    }
    process.exit(1);
  }
}

main();
