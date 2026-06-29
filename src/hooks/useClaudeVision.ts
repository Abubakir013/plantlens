import { useState, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { LANGUAGES } from '@/constants/languages';

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

// ─── Media type detection ─────────────────────────────────────────────────────
type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

function detectMediaType(base64: string): ImageMediaType {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/jpeg';
}

// ─── System prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are a world-class botanist. When given a plant image, respond with ONLY a valid JSON object — no markdown fences, no prose before or after. Use exactly this structure:
{
  "name": "Common Plant Name",
  "scientificName": "Genus species",
  "confidence": 92,
  "watering": "Short watering guidance",
  "light": "Light requirement",
  "temperature": "Ideal temperature range",
  "toxicity": "Toxicity summary",
  "funFact": "One fascinating fact",
  "guideTopics": [
    {"id":"watering","title":"Watering","summary":"One sentence."},
    {"id":"pruning","title":"Pruning","summary":"One sentence."},
    {"id":"propagation","title":"Propagation","summary":"One sentence."},
    {"id":"repotting","title":"Repotting","summary":"One sentence."},
    {"id":"fertilizing","title":"Fertilizing","summary":"One sentence."},
    {"id":"sunlight","title":"Sunlight","summary":"One sentence."},
    {"id":"temperature","title":"Temperature","summary":"One sentence."},
    {"id":"soil","title":"Soil","summary":"One sentence."},
    {"id":"commonProblems","title":"Common Problems","summary":"One sentence."}
  ]
}
Rules: All JSON keys stay in English exactly as shown. scientificName stays in Latin — do not translate it. If no plant is visible: name="Unknown Plant", scientificName="N/A", confidence=0.`;

function buildSystemPrompt(locale: string): string {
  const lang = LANGUAGES.find((l) => l.code === locale);
  const langName = lang?.englishName ?? 'English';
  if (langName === 'English') return BASE_SYSTEM_PROMPT;
  return (
    BASE_SYSTEM_PROMPT +
    `\n\nIMPORTANT: Translate ALL text values into ${langName}. Keep every JSON key in English. Keep scientificName in Latin. Translate guideTopics titles and summaries into ${langName}.`
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useClaudeVision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  const identify = useCallback(
    async (base64Image: string): Promise<PlantResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');

        const mediaType = detectMediaType(base64Image);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1200,
            system: buildSystemPrompt(locale),
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: mediaType,
                      data: base64Image,
                    },
                  },
                  { type: 'text', text: 'Identify this plant.' },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API ${response.status}: ${errText}`);
        }

        // response.json() gives us the parsed Anthropic envelope — never call
        // JSON.parse() on it again or you get "Unexpected character: 'o'".
        const envelope = await response.json();
        const raw: string =
          typeof envelope?.content?.[0]?.text === 'string'
            ? envelope.content[0].text
            : '';

        console.log('[Claude] raw response:', raw.slice(0, 200));

        // Strip markdown fences, then pull the first {...} block so any prose
        // preamble from non-English locale instructions is safely ignored.
        const fenceless = raw.replace(/```json|```/g, '').trim();
        const jsonMatch = fenceless.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON object found in Claude response');

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
          console.log('[Claude] JSON.parse failed on:', jsonMatch[0].slice(0, 300));
          throw new Error(`JSON parse failed: ${parseErr}`);
        }

        const gt = parsed.guideTopics;

        return {
          name: (parsed.name as string) ?? 'Unknown Plant',
          scientificName: (parsed.scientificName as string) ?? 'N/A',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
          watering: (parsed.watering as string) ?? '',
          light: (parsed.light as string) ?? '',
          temperature: (parsed.temperature as string) ?? '',
          toxicity: (parsed.toxicity as string) ?? '',
          funFact: (parsed.funFact as string) ?? '',
          guideTopics: Array.isArray(gt)
            ? (gt as GuideTopic[]).filter(
                (t) => t && typeof t.id === 'string' && typeof t.title === 'string'
              )
            : undefined,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to identify plant';
        console.log('[Claude] identify error:', msg);
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
