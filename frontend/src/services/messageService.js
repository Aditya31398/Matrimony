import api from './api'

export const messageService = {
  getConversations: () =>
    api.get('/messages/conversations').then((r) => r.data),

  getMessages: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}`).then((r) => r.data),

  sendMessage: (conversationId, content) =>
    api.post(`/messages/conversations/${conversationId}`, { content }).then((r) => r.data),

  getIcebreakers: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}/icebreakers`).then((r) => r.data),

  startConversation: (otherProfileId) =>
    api.post(`/messages/conversations/start/${otherProfileId}`).then((r) => r.data),
}
