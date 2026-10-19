import { useQuery } from '@tanstack/react-query'
import { useMyProfile } from './useProfiles'
import { paymentService } from '../services/paymentService'

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
