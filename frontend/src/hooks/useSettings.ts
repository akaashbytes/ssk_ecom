import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
