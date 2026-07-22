export const DOCUMENT_BOOKMARK_CHANGED_EVENT = "dbapt:document-bookmark-changed";

export type DocumentBookmarkChangedDetail = {
  documentId: string;
  isBookmarked: boolean;
};

export function notifyDocumentBookmarkChanged(detail: DocumentBookmarkChangedDetail) {
  window.dispatchEvent(
    new CustomEvent<DocumentBookmarkChangedDetail>(DOCUMENT_BOOKMARK_CHANGED_EVENT, { detail }),
  );
}
