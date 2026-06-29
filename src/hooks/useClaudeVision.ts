import { useState, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { API_BASE_URL } from '@/api/config';

export interface GuideTopic {
  id: string;
  title: string;
  summary: string;
}

export interface PlantResult {
  name: string;
  scientificName: string;
  confidence: number;
  watering: string;
  light: string;
  temperature: string;
  toxicity: string;
  funFact: string;
  guideTopics?: GuideTopic[];
}

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

function detectMediaType(base64: string): ImageMediaType {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/jpeg';
}

export function useClaudeVision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  const identify = useCallback(
    async (base64Image: string): Promise<PlantResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const mediaType = detectMediaType(base64Image);

        const response = await fetch(`${API_BASE_URL}/identify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64: base64Image, mediaType, language: locale }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API ${response.status}: ${errText}`);
        }

        const data = (await response.json()) as Record<string, unknown>;
        const gt = data.guideTopics;

        return {
          name: (data.name as string) ?? 'Unknown Plant',
          scientificName: (data.scientificName as string) ?? 'N/A',
          confidence: typeof data.confidence === 'number' ? data.confidence : 0,
          watering: (data.watering as string) ?? '',
          light: (data.light as string) ?? '',
          temperature: (data.temperature as string) ?? '',
          toxicity: (data.toxicity as string) ?? '',
          funFact: (data.funFact as string) ?? '',
          guideTopics: Array.isArray(gt)
            ? (gt as GuideTopic[]).filter(
                (t) => t && typeof t.id === 'string' && typeof t.title === 'string'
              )
            : undefined,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to identify plant';
        console.log('[identify] error:', msg);
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  return { identify, loading, error };
}
