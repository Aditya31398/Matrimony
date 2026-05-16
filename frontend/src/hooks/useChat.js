import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { CONVERSATIONS_KEY } from './useMessages'

/**
 * Opens a STOMP/WebSocket connection for real-time chat.
 *
 * Subscribes to:
 *   /topic/conversation/{conversationId}  — incoming messages for the active chat
 *   /topic/inbox/{myProfileId}            — inbox signals so the conversation list refreshes
 *
 * On unmount (or when conversationId changes) the connection is cleanly closed.
 */
export function useChat(conversationId, myProfileId) {
  const queryClient = useQueryClient()
  const clientRef   = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('soulsync_token')
    if (!token || !conversationId) return

    // Derive WS URL from the API base URL env var (or fall back to current origin)
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')
    const httpBase = apiBase.startsWith('http') ? apiBase : window.location.origin
    const brokerURL = httpBase.replace(/^http/, 'ws') + '/ws'

    const client = new Client({
      brokerURL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Real-time message push — appends directly to React Query cache, no poll needed
        client.subscribe(`/topic/conversation/${conversationId}`, (frame) => {
          const msg = JSON.parse(frame.body)
          queryClient.setQueryData(
            [CONVERSATIONS_KEY, String(conversationId), 'messages'],
            (prev = []) => {
              // Guard against duplicates (server also sends REST response)
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            }
          )
        })

        // Inbox push — refresh the conversation list when the other side sends a message
        if (myProfileId) {
          client.subscribe(`/topic/inbox/${myProfileId}`, () => {
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] })
          })
        }
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message)
      },
      onDisconnect: () => {
        console.debug('[WS] disconnected from conversation', conversationId)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [conversationId, myProfileId, queryClient])
}
