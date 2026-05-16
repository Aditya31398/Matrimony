/**
 * Inserts a Cloudinary transformation string into an upload URL.
 * Non-Cloudinary URLs (Unsplash fallbacks, etc.) are returned unchanged.
 *
 * Example:
 *   cloudinaryUrl('https://res.cloudinary.com/.../upload/v1/photos/1/abc.jpg', 'w_600,q_auto,f_auto')
 *   → 'https://res.cloudinary.com/.../upload/w_600,q_auto,f_auto/v1/photos/1/abc.jpg'
 */
export function cloudinaryUrl(url, transforms = 'w_600,q_auto,f_auto') {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', `/upload/${transforms}/`)
}

/**
 * Returns a srcSet string for two breakpoints (300 w and 600 w).
 * Returns undefined for non-Cloudinary URLs so the browser ignores it.
 */
export function cloudinarySrcSet(url) {
  if (!url || !url.includes('res.cloudinary.com')) return undefined
  return [
    `${cloudinaryUrl(url, 'w_300,q_auto,f_auto')} 300w`,
    `${cloudinaryUrl(url, 'w_600,q_auto,f_auto')} 600w`,
    `${cloudinaryUrl(url, 'w_900,q_auto,f_auto')} 900w`,
  ].join(', ')
}
