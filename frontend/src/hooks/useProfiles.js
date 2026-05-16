import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '../services/profileService'

export const PROFILES_KEY = 'profiles'
export const TOP_PICKS_KEY = 'top-picks'

/**
 * Infinite-scroll variant — used by DiscoverPage.
 * Each page is a Spring Page object; content arrays are flattened by the consumer.
 */
export function useInfiniteProfiles(params) {
  return useInfiniteQuery({
    queryKey: [PROFILES_KEY, 'infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      profileService.getAll({ ...params, page: pageParam, size: 12 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) return undefined
      return (lastPage.number ?? 0) + 1
    },
    staleTime: 2 * 60 * 1000,
  })
}

/** Non-paginated variant kept for DashboardPage top-picks section. */
export function useProfiles(params) {
  return useQuery({
    queryKey: [PROFILES_KEY, params],
    queryFn: () => profileService.getAll(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useTopPicks() {
  return useQuery({
    queryKey: [TOP_PICKS_KEY],
    queryFn: profileService.getTopPicks,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchProfiles(params) {
  return useQuery({
    queryKey: [PROFILES_KEY, 'search', params],
    queryFn: () => profileService.search(params),
    enabled: !!params,
  })
}

export function useRegisterProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.register,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] }),
  })
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000,
  })
}

export function useViewers() {
  return useQuery({
    queryKey: ['viewers'],
    queryFn: profileService.getViewers,
    staleTime: 2 * 60 * 1000,
  })
}
