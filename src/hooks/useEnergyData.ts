import { useQuery } from '@tanstack/react-query';

const API_URL = 'https://functions.poehali.dev/0335f84a-22ea-47e1-ab0f-623e2884ffec';

interface EnergyEntry {
  date: string;
  score: number;
  thoughts: string;
  category: string;
  week: string;
  month: string;
}

interface EnergyStats {
  good: number;
  neutral: number;
  bad: number;
  average: number;
  total: number;
}

interface EnergyData {
  entries: EnergyEntry[];
  stats: EnergyStats;
}

export const useEnergyData = () => {
  return useQuery<EnergyData>({
    queryKey: ['energy-data'],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch energy data');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
};
