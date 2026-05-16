import api from './api'

export const profileService = {
  // Returns Spring Page object: { content, number, last, totalElements, … }
  getAll: (params = {}) =>
    api.get('/profiles', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/profiles/${id}`).then((r) => r.data),

  getTopPicks: () =>
    api.get('/profiles/top-picks').then((r) => r.data),

  search: (params) =>
    api.get('/profiles/search', { params }).then((r) => r.data),

  register: (data) =>
    api.post('/profiles', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/profiles/${id}`, data).then((r) => r.data),

  getMe: () =>
    api.get('/profiles/me').then((r) => r.data),

  getViewers: () =>
    api.get('/profiles/views/me').then((r) => r.data),
}
