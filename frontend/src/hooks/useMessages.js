import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService } from '../services/messageService'

export const CONVERSATIONS_KEY = 'conversations'

export function useConversations() {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY],
    queryFn: messageService.getConversations,
    refetchInterval: 30_000, // poll every 30 s (was 3 s — 10× fewer requests)
    refetchIntervalInBackground: false,
  })
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, conversationId, 'messages'],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

export function useIcebreakers(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, conversationId, 'icebreakers'],
    queryFn: () => messageService.getIcebreakers(conversationId),
    enabled: !!conversationId,
    staleTime: Infinity, // icebreakers are static
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
