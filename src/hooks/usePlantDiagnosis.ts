import { useState, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { API_BASE_URL } from '@/api/config';

export interface DiagnosisTreatmentStep {
  step: number;
  title: string;
  detail: string;
  timeframe: string;
}

export interface DiagnosisResult {
  isPlant: boolean;
  plantName: string;
  isHealthy: boolean;
  healthScore: number;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  diagnosis: {
    problemName: string;
    problemType: 'disease' | 'pest' | 'nutrient' | 'watering' | 'light' | 'environment';
    confidence: number;
    visibleSymptoms: string[];
  };
  cause: {
    summary: string;
    contributingFactors: string[];
  };
  treatment: {
    urgency: string;
    steps: DiagnosisTreatmentStep[];
    materialsNeeded: string[];
  };
  prevention: {
    summary: string;
    tips: string[];
  };
  expectedRecovery: string;
}

function detectMediaType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

export function usePlantDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  const diagnose = useCallback(
    async (base64Image: string): Promise<DiagnosisResult | null> => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 60_000);

      try {
        const mediaType = detectMediaType(base64Image);
        const response = await fetch(`${API_BASE_URL}/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, mediaType, language: locale }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API ${response.status}: ${errText}`);
        }

        return (await response.json()) as DiagnosisResult;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to diagnose plant';
        setError(msg);
        return null;
      } finally {
        clearTimeout(tid);
        setLoading(false);
      }
    },
    [locale]
  );

  return { diagnose, loading, error };
}
