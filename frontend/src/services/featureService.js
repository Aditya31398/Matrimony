import api from './api'

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data.count),
  readAll: () => api.post('/notifications/read-all'),
  read: (id) => api.post(`/notifications/${id}/read`),
}

export const safetyService = {
  block: (profileId) => api.post(`/profiles/${profileId}/block`).then((r) => r.data),
  unblock: (profileId) => api.delete(`/profiles/${profileId}/block`).then((r) => r.data),
  blocked: () => api.get('/blocks').then((r) => r.data),
  report: (profileId, { reason, details, block }) =>
    api.post(`/profiles/${profileId}/report`, { reason, details, block }).then((r) => r.data),
}

export const shareService = {
  create: (profileId) => api.post(`/share/${profileId}`).then((r) => r.data),
  view: (token) => api.get(`/public/share/${token}`).then((r) => r.data),
}

export const discoveryService = {
  dailyPicks: () => api.get('/profiles/daily-picks').then((r) => r.data),
  matchScore: (profileId) => api.get(`/profiles/${profileId}/match-score`).then((r) => r.data),
}
