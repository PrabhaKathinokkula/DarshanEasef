// Central place for resolving temple image URLs.
// Previously this logic (API origin + uploads-path check + fallback) was
// duplicated in TempleCard.jsx, TempleDetails.jsx, and MyTemple.jsx.

// In dev, Vite proxies nothing by default, so the backend origin is needed
// to resolve files served from /uploads. Configure via VITE_API_ORIGIN for
// non-local deployments; falls back to the local dev server.
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";

export const DEFAULT_TEMPLE_IMAGE = "/images/temples/default-temple.svg";

/**
 * Resolves a temple's image field into a displayable <img> src.
 * - No image on record -> local default temple graphic (never a real
 *   unrelated landmark).
 * - Backend-uploaded file ("/uploads/...") -> prefixed with API origin.
 * - Anything else (absolute http(s) URL, or a local /images/... asset) ->
 *   used as-is.
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_TEMPLE_IMAGE;
  if (imagePath.startsWith("/uploads")) return `${API_ORIGIN}${imagePath}`;
  return imagePath;
};
