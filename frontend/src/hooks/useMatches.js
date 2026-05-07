import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchService } from '../services/matchService'

export const MATCHES_KEY = 'matches'
export const INTERESTED_KEY = 'interested'

export function useMatches() {
  return useQuery({
    queryKey: [MATCHES_KEY],
    queryFn: matchService.getMatches,
  })
}

export function useInterested() {
  return useQuery({
    queryKey: [INTERESTED_KEY],
    queryFn: matchService.getInterested,
  })
}

export function useConnect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchService.sendConnect,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] }),
  })
}

export function useShortlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchService.shortlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] }),
  })
}

export function useAcceptMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchService.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHES_KEY] })
      queryClient.invalidateQueries({ queryKey: [INTERESTED_KEY] })
    },
  })
}

export function useDeclineMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: matchService.decline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INTERESTED_KEY] }),
  })
}
