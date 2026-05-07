import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService } from '../services/messageService'

export const CONVERSATIONS_KEY = 'conversations'

export function useConversations() {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY],
    queryFn: messageService.getConversations,
    refetchInterval: 3000,
  })
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, conversationId, 'messages'],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 3000,
  })
}

export function useIcebreakers(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, conversationId, 'icebreakers'],
    queryFn: () => messageService.getIcebreakers(conversationId),
    enabled: !!conversationId,
  })
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content) => messageService.sendMessage(conversationId, content),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY, conversationId, 'messages'] }),
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageService.startConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] }),
  })
}
