import api from './api'

export const matchService = {
  getMatches: () =>
    api.get('/matches').then((r) => r.data),

  getInterested: () =>
    api.get('/matches/interested').then((r) => r.data),

  sendConnect: (profileId) =>
    api.post(`/matches/${profileId}/connect`).then((r) => r.data),

  shortlist: (profileId) =>
    api.post(`/matches/${profileId}/shortlist`).then((r) => r.data),

  accept: (matchId) =>
    api.put(`/matches/${matchId}/accept`).then((r) => r.data),

  decline: (matchId) =>
    api.put(`/matches/${matchId}/decline`).then((r) => r.data),
}
