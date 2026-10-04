# Blog Post Creation

To create a new blog post, you can use the interactive CLI:

```bash
pnpm create-post
```

This will prompt you for:

- Title
- Description
- Cover image URL
- Tags (comma-separated)

The post is written to `content/blog/` as `NN-slug.md`, where `NN` is the
post's position when all posts are ordered by their `date` frontmatter
(oldest first). The public URL stays `/blog/slug`. The number only orders
files and never appears in URLs.

## Numbering

Every file in `content/blog/` is prefixed `NN-`, recomputed from scratch
whenever a post is created, updated, deleted, or published. You can also
run it on demand:

```bash
pnpm renumber
```

Run it after editing a post's `date` frontmatter or dropping a `.md` file
into `content/blog/` by hand; it always re-derives the order from the
current files rather than assuming the last state.

## Managing Published Posts

### Updating Posts

To update a published post:

```bash
pnpm update-post
```

This will:

1. Show a list of published posts
2. Let you select which post to update
3. Prompt for new title, description, and tags
4. Open your editor to update content
5. Keep existing values if left empty

You can also specify the post slug directly, with or without the prefix:

```bash
pnpm update-post my-published-post
pnpm update-post 05-my-published-post
```

If the title change produces a new slug, the file is renamed and keeps its
numbering position (ordering is by `date`, which is preserved on update).

### Deleting Posts

```bash
pnpm delete-post
```

This permanently deletes the file and renumbers the remaining posts.
A post that was committed stays recoverable via git history.

## Draft System

Drafts are plain markdown scratch files in `content/_drafts/` (gitignored,
so a draft can never reach production). They get no `NN-` prefix until
published.

### Creating Drafts

```bash
pnpm draft-post
```

This will prompt you for:

- Draft title
- Description
- Tags

You can also provide the title directly:

```bash
pnpm draft-post "My Draft Post"
```

Drafts are stored in `content/_drafts/` with a `.draft.md` extension.
Edit or delete them directly, they're just files.

### Publishing Drafts

When your draft is ready:

```bash
pnpm publish-draft
```

This will:

1. Show a list of available drafts
2. Let you select which draft to publish
3. Move it to `content/blog/`, set `status`, `publishDate` and `date`, then
   renumber so it takes the last position (newest date)

You can also specify the draft slug directly:

```bash
pnpm publish-draft my-draft-post
```
