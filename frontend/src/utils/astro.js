// Must match AstrologyService on the backend (names are sent as-is)
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
]

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
]

const RASHI_ENGLISH = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export const rashiLabel = (rashi) => {
  const i = RASHIS.indexOf(rashi)
  return i < 0 ? rashi : `${rashi} (${RASHI_ENGLISH[i]})`
}

/** Rashis a star can fall in — each star's 4 padas span one or two signs of 9 padas each. */
export function rashisForNakshatra(nakshatra) {
  const n = NAKSHATRAS.indexOf(nakshatra)
  if (n < 0) return RASHIS
  const first = Math.floor((n * 4) / 9)
  const last = Math.floor((n * 4 + 3) / 9)
  return first === last ? [RASHIS[first]] : [RASHIS[first], RASHIS[last]]
}
