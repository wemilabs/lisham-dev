import prompts from "prompts";
import { deletePost, listPosts } from "../lib/posts";

async function main() {
  try {
    // Get command line arguments
    const [, , slug] = process.argv;

    let targetSlug = slug;

    // If no slug provided, list available posts and prompt for selection
    if (!targetSlug) {
      const posts = await listPosts();

      const response = await prompts({
        type: "select",
        name: "slug",
        message: "Select a post to delete:",
        choices: posts.map((post) => ({
          title: `${post.title} (${post.date.toLocaleDateString()})`,
          value: post.slug,
        })),
      });

      if (!response.slug) {
        throw new Error("ABORTED");
      }

      targetSlug = response.slug;
    }

    // Get confirmation
    const confirmation = await prompts({
      type: "confirm",
      name: "value",
      message: `Permanently delete "${targetSlug}"? (A committed post stays recoverable via git history)`,
      initial: false,
    });

    if (!confirmation.value) {
      throw new Error("ABORTED");
    }

    // Delete the post and renumber the directory
    await deletePost(targetSlug);
    console.log("✅ Deleted post:", targetSlug);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "ABORTED") {
        console.log("❌ Operation cancelled");
        process.exit(0);
      }
      console.error("❌ Failed to delete post:", error.message);
    } else {
      console.error("❌ An unexpected error occurred");
    }
    process.exit(1);
  }
}

main();
