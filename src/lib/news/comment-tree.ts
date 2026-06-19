type CommentTreeInput = {
  id: string;
  parentId?: string | null;
};

type NormalizedComment<T extends CommentTreeInput> = Omit<T, "parentId" | "replies"> & {
  parentId: string | null;
};

export type ShallowCommentTreeNode<T extends CommentTreeInput> = NormalizedComment<T> & {
  replies: ShallowCommentTreeNode<T>[];
};

export function buildShallowCommentTree<T extends CommentTreeInput>(
  comments: readonly T[],
): ShallowCommentTreeNode<T>[] {
  const commentViews = comments.map((comment) => ({
    ...comment,
    parentId: comment.parentId || null,
    replies: [] as ShallowCommentTreeNode<T>[],
  })) as ShallowCommentTreeNode<T>[];
  const byId = new Map(commentViews.map((comment) => [comment.id, comment]));
  const topLevelComments: ShallowCommentTreeNode<T>[] = [];

  for (const comment of commentViews) {
    if (!comment.parentId) {
      topLevelComments.push(comment);
      continue;
    }

    const parent = byId.get(comment.parentId);
    if (!parent) {
      comment.parentId = null;
      topLevelComments.push(comment);
      continue;
    }

    const topLevelParent = findTopLevelParent(parent, byId);
    comment.parentId = topLevelParent.id;
    topLevelParent.replies.push(comment);
  }

  return topLevelComments;
}

function findTopLevelParent<T extends CommentTreeInput>(
  comment: ShallowCommentTreeNode<T>,
  byId: Map<string, ShallowCommentTreeNode<T>>,
) {
  let current = comment;

  while (current.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }

  return current;
}
