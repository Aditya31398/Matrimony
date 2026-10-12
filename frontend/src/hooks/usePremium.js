import { useQuery } from '@tanstack/react-query'
import { useMyProfile } from './useProfiles'
import { astroService, paymentService } from '../services/paymentService'

/** Premium status of the signed-in member, derived from their own profile. */
export function usePremium() {
  const { data: me, isLoading } = useMyProfile()
  return {
    isPremium: !!me?.isPremium,
    premiumUntil: me?.premiumUntil ?? null,
    isLoading,
  }
}

export function usePlans() {
  return useQuery({
    queryKey: ['premium-plans'],
    queryFn: paymentService.getPlans,
    staleTime: 10 * 60 * 1000,
  })
}

export function useAstroMatch(profileId, enabled) {
  return useQuery({
    queryKey: ['astro-match', String(profileId)],
    queryFn: () => astroService.match(profileId),
    enabled: !!profileId && enabled,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
