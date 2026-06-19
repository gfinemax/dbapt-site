type FreePostIdentity = {
  id: string;
};

export function buildFreeBoardFocusedPostUrl(currentHref: string, postId: string | null): string {
  const nextUrl = new URL(currentHref);
  nextUrl.searchParams.set("tab", "free");

  if (postId) {
    nextUrl.searchParams.set("post", postId);
  } else {
    nextUrl.searchParams.delete("post");
  }

  return `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`;
}

export function findFocusedFreePostId(
  searchParams: Pick<URLSearchParams, "get">,
  posts: readonly FreePostIdentity[],
): string | null {
  const postId = searchParams.get("post");
  if (!postId) return null;

  return posts.some((post) => post.id === postId) ? postId : null;
}
