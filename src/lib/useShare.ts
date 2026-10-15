import { useState } from 'react';

/**
 * Shares the current page via the native share sheet, falling back to copying
 * the URL. `copied` flips true for 2s after a clipboard copy.
 */
export function useShare(title: string) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User dismissed the share sheet.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing more we can do.
    }
  }

  return { share, copied };
}
