/**
 * Share and copy helpers that report what actually happened, so the UI never claims a success
 * that did not occur.
 */

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or document not focused: try the legacy path below.
    }
  }
  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function shareLink(payload: { title: string; text?: string; url: string }): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    const canShare = typeof navigator.canShare !== "function" || navigator.canShare(payload);
    if (canShare) {
      try {
        await navigator.share(payload);
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
        // NotAllowedError and friends: fall back to copying the link.
      }
    }
  }
  return (await copyText(payload.url)) ? "copied" : "failed";
}

export function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}
