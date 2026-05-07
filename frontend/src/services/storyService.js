import api from './api'

export const storyService = {
  getAll: () =>
    api.get('/stories').then((r) => r.data),

  getById: (id) =>
    api.get(`/stories/${id}`).then((r) => r.data),
}
