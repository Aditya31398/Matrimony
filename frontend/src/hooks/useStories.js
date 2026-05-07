import { useQuery } from '@tanstack/react-query'
import { storyService } from '../services/storyService'

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: storyService.getAll,
  })
}
