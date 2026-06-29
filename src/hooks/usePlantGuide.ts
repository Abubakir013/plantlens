import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { LANGUAGES } from '@/constants/languages';
import type { SavedPlant } from '@/hooks/usePlantCollection';


const PLANT_STORAGE_KEY = 'plantlens_collection_v1';

export interface PlantGuide {
  title: string;
  seasonOrKeyFacts: string;
  benefits: string[];
  detailedText: string;
  tips: string[];
}

// ─── Module-level state (shared across all component instances) ───────────────
const guideCache = new Map<string, PlantGuide>();
// In-flight promises — reused by any caller that asks for the same key while
// a request is already running, preventing duplicate API calls.
const inFlight = new Map<string, Promise<PlantGuide | null>>();

function makeCacheKey(latinName: string, topicId: string, language: string): string {
  return `${latinName}\0${topicId}\0${language}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Language name lookup ─────────────────────────────────────────────────────
function langName(locale: string): string {
  const lang = LANGUAGES.find((l) => l.code === locale);
  return lang?.englishName ?? 'English';
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildGuidePrompt(latinName: string, topicTitle: string, locale: string): string {
  const lang = langName(locale);
  return (
    `You are an expert botanist. Write an in-depth care guide about "${topicTitle}" specifically for ${latinName}.\n` +
    `Respond with ONLY a valid JSON object — no markdown fences, no prose:\n` +
    `{\n` +
    `  "title": "Guide title",\n` +
    `  "seasonOrKeyFacts": "One sentence: best season, timing, or 2-3 key facts",\n` +
    `  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],\n` +
    `  "detailedText": "2-3 paragraphs of expert, plant-specific guidance.",\n` +
    `  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3", "Practical tip 4"]\n` +
    `}\n` +
    `Rules: JSON keys in English. Translate ALL text values into ${lang}.`
  );
}

// ─── Core Anthropic fetch (single attempt, throws on failure) ─────────────────
async function callAnthropicForGuide(
  latinName: string,
  topicTitle: string,
  language: string
): Promise<PlantGuide> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: buildGuidePrompt(latinName, topicTitle, language),
      messages: [
        { role: 'user', content: `Write the ${topicTitle} guide for ${latinName}.` },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API ${response.status}: ${errText}`);
  }

  const envelope = await response.json();
  const raw: string =
    typeof envelope?.content?.[0]?.text === 'string' ? envelope.content[0].text : '';

  const fenceless = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = fenceless.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in guide response');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return {
    title: (parsed.title as string) ?? topicTitle,
    seasonOrKeyFacts: (parsed.seasonOrKeyFacts as string) ?? '',
    benefits: Array.isArray(parsed.benefits) ? (parsed.benefits as string[]) : [],
    detailedText: (parsed.detailedText as string) ?? '',
    tips: Array.isArray(parsed.tips) ? (parsed.tips as string[]) : [],
  };
}

// ─── Fetch one guide with retry + in-flight dedup ─────────────────────────────
function fetchOneWithRetry(
  latinName: string,
  topicId: string,
  topicTitle: string,
  language: string,
  maxRetries = 2
): Promise<PlantGuide | null> {
  const key = makeCacheKey(latinName, topicId, language);

  if (guideCache.has(key)) return Promise.resolve(guideCache.get(key)!);
  if (inFlight.has(key)) return inFlight.get(key)!;

  const p = (async () => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) await sleep(700 * attempt); // 700ms → 1400ms backoff
      try {
        const guide = await callAnthropicForGuide(latinName, topicTitle, language);
        guideCache.set(key, guide);
        return guide;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown';
        console.log(`[Guide] ${topicId} attempt ${attempt + 1}/${maxRetries + 1} failed: ${msg}`);
        if (attempt === maxRetries) return null;
      }
    }
    return null;
  })();

  inFlight.set(key, p);
  p.then(() => inFlight.delete(key)).catch(() => inFlight.delete(key));
  return p;
}

// ─── Public utilities (called directly by screens, not through the hook) ──────

/** Synchronous — returns the guide if already cached, null otherwise. */
export function getCachedGuide(
  latinName: string,
  topicId: string,
  language: string
): PlantGuide | null {
  return guideCache.get(makeCacheKey(latinName, topicId, language)) ?? null;
}

/**
 * Seed the module-level cache from a saved plant's stored guides.
 * Only imports guides whose language matches the current locale (avoids stale translations).
 */
export function seedCacheFromSavedPlant(
  plant: Pick<SavedPlant, 'scientificName' | 'guidesCache' | 'guidesCacheLanguage'>,
  currentLocale: string
): void {
  if (!plant.guidesCache || plant.guidesCacheLanguage !== currentLocale) return;
  for (const [topicId, guide] of Object.entries(plant.guidesCache)) {
    const key = makeCacheKey(plant.scientificName, topicId, currentLocale);
    if (!guideCache.has(key)) guideCache.set(key, guide);
  }
}

/**
 * Snapshot all guides currently in cache for a given plant + language.
 * Used when saving to persist whatever has been prefetched so far.
 */
export function snapshotCachedGuides(
  latinName: string,
  topics: Array<{ id: string }>,
  language: string
): Record<string, PlantGuide> {
  const result: Record<string, PlantGuide> = {};
  for (const { id } of topics) {
    const guide = guideCache.get(makeCacheKey(latinName, id, language));
    if (guide) result[id] = guide;
  }
  return result;
}

/**
 * Persist a single fetched guide back into the plant's AsyncStorage record.
 * Called from guide-detail after any successful fetch (prefetched or on-tap),
 * so the cache grows over time and eventually covers all 9 topics offline.
 */
export async function persistGuideForPlant(
  plantId: string,
  topicId: string,
  guide: PlantGuide,
  language: string
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PLANT_STORAGE_KEY);
    if (!raw) return;
    const plants = JSON.parse(raw) as Array<Record<string, unknown>>;
    const idx = plants.findIndex((p) => p.id === plantId);
    if (idx < 0) return;
    const plant = plants[idx];
    const storedLang = plant.guidesCacheLanguage as string | undefined;
    // Skip if the stored cache is a different language (would mix translations)
    if (storedLang && storedLang !== language) return;
    const existing = (plant.guidesCache as Record<string, PlantGuide>) ?? {};
    plants[idx] = {
      ...plant,
      guidesCache: { ...existing, [topicId]: guide },
      guidesCacheLanguage: language,
    };
    await AsyncStorage.setItem(PLANT_STORAGE_KEY, JSON.stringify(plants));
  } catch (e) {
    console.log('[Guide] persistGuideForPlant error:', e);
  }
}

// ─── Hook (used by guide-detail screen) ──────────────────────────────────────
export function usePlantGuide() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuide = useCallback(
    async (
      latinName: string,
      topicId: string,
      topicTitle: string,
      language: string
    ): Promise<PlantGuide | null> => {
      // Instant cache hit — no loading state needed
      const cached = guideCache.get(makeCacheKey(latinName, topicId, language));
      if (cached) return cached;

      setLoading(true);
      setError(null);
      try {
        const guide = await fetchOneWithRetry(latinName, topicId, topicTitle, language);
        if (!guide) throw new Error('Failed after retries');
        return guide;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load guide');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchGuide, loading, error };
}
