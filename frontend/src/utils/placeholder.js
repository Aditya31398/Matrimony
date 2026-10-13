// Neutral silhouette shown when a member hasn't uploaded a photo
export const AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150">' +
      '<rect width="120" height="150" fill="#F6ECEB"/>' +
      '<circle cx="60" cy="58" r="26" fill="#E8DADA"/>' +
      '<path d="M14 150c4-36 24-52 46-52s42 16 46 52z" fill="#E8DADA"/>' +
    '</svg>'
  )

/** onError handler that swaps a broken image for the placeholder once. */
export const showPlaceholderOnError = (e) => {
  if (e.currentTarget.src !== AVATAR_PLACEHOLDER) e.currentTarget.src = AVATAR_PLACEHOLDER
}
