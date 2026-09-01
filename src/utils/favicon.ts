/**
 * Dynamically updates the browser's <link rel="icon"> favicon tag
 */
export function updateBrowserFavicon(iconUrl: string) {
  if (typeof document === 'undefined' || !iconUrl) return;

  try {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconUrl;

    // Also update apple-touch-icon if present
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (appleLink) {
      appleLink.href = iconUrl;
    }
  } catch (err) {
    console.warn('Failed to update dynamic favicon:', err);
  }
}
