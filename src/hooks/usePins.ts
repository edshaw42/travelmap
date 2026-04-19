import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPins, submitPin } from '../lib/sheetClient'
import type { NewPin } from '../types/pin'

export function usePins() {
  return useQuery({
    queryKey: ['pins'],
    queryFn: fetchPins,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useAddPin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pin: NewPin) => submitPin(pin),
    onSuccess: () => {
      // Allow Apps Script time to write then refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['pins'] })
      }, 5000)
    },
  })
}
