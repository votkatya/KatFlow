import { useQuery } from '@tanstack/react-query';

const DEFAULT_ENERGY_API_URL =
  'https://functions.poehali.dev/0335f84a-22ea-47e1-ab0f-623e2884ffec';

const resolveEnvUrl = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  return trimmed;
};

const envEnergyUrl = resolveEnvUrl(import.meta.env?.VITE_ENERGY_API_URL);

export const ENERGY_API_URL = envEnergyUrl || DEFAULT_ENERGY_API_URL;

const envCreateUrl = resolveEnvUrl(
  import.meta.env?.VITE_ENERGY_CREATE_ENTRY_URL,
);

export const ENERGY_CREATE_ENTRY_URL = envCreateUrl || ENERGY_API_URL;

export const IS_DEFAULT_ENERGY_API = ENERGY_API_URL === DEFAULT_ENERGY_API_URL;

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
      const response = await fetch(ENERGY_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch energy data');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
};
