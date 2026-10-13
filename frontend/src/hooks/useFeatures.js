import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, safetyService, discoveryService } from '../services/featureService'
import { useAuth } from '../context/AuthContext'

export function useUnreadNotifications() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationService.unreadCount,
    enabled: isLoggedIn,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  })
}

export function useNotifications(enabled) {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: notificationService.list,
    enabled,
    staleTime: 0,
  })
}

export function useDailyPicks() {
  return useQuery({
    queryKey: ['daily-picks'],
    queryFn: discoveryService.dailyPicks,
    staleTime: 30 * 60 * 1000,
  })
}

export function useMatchScore(profileId, enabled = true) {
  return useQuery({
    queryKey: ['match-score', String(profileId)],
    queryFn: () => discoveryService.matchScore(profileId),
    enabled: !!profileId && enabled,
    staleTime: 10 * 60 * 1000,
  })
}

export function useBlockedMembers(enabled = true) {
  return useQuery({ queryKey: ['blocked'], queryFn: safetyService.blocked, enabled })
}

/** Blocking changes almost every list, so refresh everything afterwards. */
export function useBlockToggle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ profileId, block }) => (block ? safetyService.block(profileId) : safetyService.unblock(profileId)),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
