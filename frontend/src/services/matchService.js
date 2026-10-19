import api from './api'

export const matchService = {
  getMatches: () =>
    api.get('/matches').then((r) => r.data),

  getInterested: () =>
    api.get('/matches/interested').then((r) => r.data),

  // Accepts a profile id, or { profileId, note } to include a personal note
  sendConnect: (arg) => {
    const { profileId, note } = typeof arg === 'object' ? arg : { profileId: arg }
    return api.post(`/matches/${profileId}/connect`, note ? { note } : {}).then((r) => r.data)
  },

  shortlist: (profileId) =>
    api.post(`/matches/${profileId}/shortlist`).then((r) => r.data),

  accept: (matchId) =>
    api.put(`/matches/${matchId}/accept`).then((r) => r.data),

  decline: (matchId) =>
    api.put(`/matches/${matchId}/decline`).then((r) => r.data),
}
