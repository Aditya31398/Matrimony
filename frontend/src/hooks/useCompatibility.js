import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useCompatibility(targetProfileId) {
  return useQuery({
    queryKey: ['compatibility', targetProfileId],
    queryFn: () => api.get(`/compatibility/${targetProfileId}`).then((r) => r.data),
    enabled: !!targetProfileId,
    staleTime: 1000 * 60 * 10, // compatibility doesn't change often
    retry: false,
  })
}
