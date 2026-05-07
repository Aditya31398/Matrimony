import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '../services/profileService'

export const PROFILES_KEY = 'profiles'
export const TOP_PICKS_KEY = 'top-picks'

export function useProfiles(params) {
  return useQuery({
    queryKey: [PROFILES_KEY, params],
    queryFn: () => profileService.getAll(params),
  })
}

export function useTopPicks() {
  return useQuery({
    queryKey: [TOP_PICKS_KEY],
    queryFn: profileService.getTopPicks,
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
  })
}

export function useViewers() {
  return useQuery({
    queryKey: ['viewers'],
    queryFn: profileService.getViewers,
  })
}
