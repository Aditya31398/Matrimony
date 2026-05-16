import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService } from '../services/messageService'

export const CONVERSATIONS_KEY = 'conversations'

/**
 * Conversation list — polls lightly as a fallback for when the user has the
 * inbox open but isn't inside an active chat (no WS connected). 60 s is fine;
 * the WS inbox push covers the real-time case when they're in a conversation.
 */
export function useConversations() {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY],
    queryFn: messageService.getConversations,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

/**
 * Message list — NO polling. Real-time updates come via WebSocket (useChat).
 * This query only fires once on mount to hydrate the initial message history.
 */
export function useMessages(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, String(conversationId), 'messages'],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: Infinity, // WS keeps it fresh; never auto-refetch
  })
}

export function useIcebreakers(conversationId) {
  return useQuery({
    queryKey: [CONVERSATIONS_KEY, conversationId, 'icebreakers'],
    queryFn: () => messageService.getIcebreakers(conversationId),
    enabled: !!conversationId,
    staleTime: Infinity,
  })
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content) => messageService.sendMessage(conversationId, content),
    onSuccess: (newMsg) => {
      // Optimistically add own message immediately (WS push deduplicates)
      queryClient.setQueryData(
        [CONVERSATIONS_KEY, String(conversationId), 'messages'],
        (prev = []) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        }
      )
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageService.startConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] }),
  })
}
