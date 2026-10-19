// Each item: [label, weight, isFilled(profile)]. Weights sum to 100.
const ITEMS = [
  ['Profile photo', 15, (p) => !!p.photoUrl],
  ['More photos (2+)', 5, (p) => (p.photos?.length ?? 0) >= 2],
  ['About me', 10, (p) => (p.bio?.trim().length ?? 0) >= 30],
  ['City', 5, (p) => !!p.city],
  ['Profession', 5, (p) => !!p.profession],
  ['Education', 5, (p) => !!p.education],
  ['Religion', 5, (p) => !!p.religion],
  ['Caste', 5, (p) => !!p.caste],
  ['Mother tongue', 5, (p) => !!p.motherTongue],
  ['Height', 5, (p) => !!p.height],
  ['Diet', 5, (p) => !!p.dietaryPreference],
  ['Interests (3+)', 5, (p) => (p.interests?.length ?? 0) >= 3],
  ['Birth star', 10, (p) => !!p.nakshatra],
  ['Phone number', 5, (p) => !!p.phone],
  ['Partner preferences', 5, (p) => !!p.lookingForGender && !!p.ageMin && !!p.ageMax],
]

/** { percent, missing: [labels by importance] } for the signed-in member's own profile. */
export function profileCompleteness(profile) {
  if (!profile) return { percent: 0, missing: [] }
  let percent = 0
  const missing = []
  for (const [label, weight, filled] of ITEMS) {
    if (filled(profile)) percent += weight
    else missing.push({ label, weight })
  }
  missing.sort((a, b) => b.weight - a.weight)
  return { percent, missing: missing.map((m) => m.label) }
}
