export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
]

export const RASHI_NAMES = [
  'Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)',
  'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrischika)',
  'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)',
]

// Primary rashi for each nakshatra — must mirror NakshatraData.RASHI on the backend.
export const NAKSHATRA_RASHI = [
  1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12,
]

export const nakshatraName = (n) => NAKSHATRA_NAMES[n - 1] ?? null
export const rashiName = (r) => RASHI_NAMES[r - 1] ?? null

/** Moon sign label; when only the star is known, the rashi it falls in (matches the backend). */
export const moonSign = (p) => {
  if (p?.rashi) return rashiName(p.rashi)
  if (p?.nakshatra) return `${rashiName(NAKSHATRA_RASHI[p.nakshatra - 1])} · from star`
  return null
}
