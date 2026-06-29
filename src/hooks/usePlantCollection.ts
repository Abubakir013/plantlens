import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import type { GuideTopic } from '@/hooks/useClaudeVision';
import type { PlantGuide } from '@/hooks/usePlantGuide';

export interface SavedPlant {
  id: string;
  name: string;
  scientificName: string;
  imageUri: string;
  dateIdentified: string;
  confidence: number;
  watering: string;
  light: string;
  temperature: string;
  toxicity: string;
  funFact: string;
  guideTopics?: GuideTopic[];
  /** Prefetched guide content keyed by topicId, persisted so detail works offline. */
  guidesCache?: Record<string, PlantGuide>;
  /** The locale these cached guides were generated in — used to skip stale translations. */
  guidesCacheLanguage?: string;
}

const STORAGE_KEY = 'plantlens_collection_v1';

export function usePlantCollection() {
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPlants(JSON.parse(raw) as SavedPlant[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reload = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setPlants(raw ? (JSON.parse(raw) as SavedPlant[]) : []);
    } catch (e) {
      console.error('usePlantCollection reload error:', e);
    }
  }, []);

  const persist = useCallback(async (updated: SavedPlant[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const savePlant = useCallback(
    async (plant: SavedPlant) => {
      const updated = [plant, ...plants];
      setPlants(updated);
      await persist(updated);
    },
    [plants, persist]
  );

  const deletePlant = useCallback(
    async (id: string) => {
      const updated = plants.filter((p) => p.id !== id);
      setPlants(updated);
      await persist(updated);
    },
    [plants, persist]
  );

  return { plants, loading, savePlant, deletePlant, reload };
}
