#!/usr/bin/env node
'use strict';

const MODEL = 'claude-sonnet-4-6';

// Inline .env loader — no dotenv package required
try {
  const fs = require('fs');
  const envPath = require('path').join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  }
} catch {}

const http = require('http');
const https = require('https');

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const API_KEY =
  process.env.ANTHROPIC_API_KEY ?? process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

if (!API_KEY) {
  console.error('❌  Set ANTHROPIC_API_KEY (or EXPO_PUBLIC_ANTHROPIC_API_KEY) in .env');
  process.exit(1);
}

// ─── Locale → English language name ──────────────────────────────────────────
const LOCALE_LANG = {
  af:'Afrikaans',ar:'Arabic',az:'Azerbaijani',be:'Belarusian',bg:'Bulgarian',
  bn:'Bengali',ca:'Catalan',cs:'Czech',cy:'Welsh',da:'Danish',de:'German',
  el:'Greek',en:'English',es:'Spanish',et:'Estonian',eu:'Basque',fa:'Persian',
  fi:'Finnish',fr:'French',ga:'Irish',gl:'Galician',gu:'Gujarati',he:'Hebrew',
  hi:'Hindi',hr:'Croatian',hu:'Hungarian',hy:'Armenian',id:'Indonesian',
  is:'Icelandic',it:'Italian',ja:'Japanese',ka:'Georgian',kk:'Kazakh',
  km:'Khmer',kn:'Kannada',ko:'Korean',lt:'Lithuanian',lv:'Latvian',
  mk:'Macedonian',ml:'Malayalam',mn:'Mongolian',mr:'Marathi',ms:'Malay',
  mt:'Maltese',my:'Burmese',nb:'Norwegian',ne:'Nepali',nl:'Dutch',pa:'Punjabi',
  pl:'Polish',pt:'Portuguese',ro:'Romanian',ru:'Russian',sk:'Slovak',sl:'Slovenian',
  sq:'Albanian',sr:'Serbian',sv:'Swedish',sw:'Swahili',ta:'Tamil',te:'Telugu',
  th:'Thai',tl:'Filipino',tr:'Turkish',uk:'Ukrainian',ur:'Urdu',uz:'Uzbek',
  vi:'Vietnamese',zh:'Chinese',zu:'Zulu',
};

function langName(locale = 'en') {
  return LOCALE_LANG[String(locale).split('-')[0].toLowerCase()] ?? 'English';
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
const IDENTIFY_BASE = `You are a world-class botanist. When given a plant image, respond with ONLY a valid JSON object — no markdown fences, no prose before or after. Use exactly this structure:
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
Rules: JSON keys stay in English exactly as shown. scientificName stays in Latin — do not translate it. If no plant is visible: name="Unknown Plant", scientificName="N/A", confidence=0.`;

function buildIdentifyPrompt(locale) {
  const lang = langName(locale);
  if (lang === 'English') return IDENTIFY_BASE;
  return (
    IDENTIFY_BASE +
    `\nIMPORTANT: Translate ALL text VALUES into ${lang}. Keep every JSON key in English. Keep scientificName in Latin. Translate guideTopics titles and summaries into ${lang}.`
  );
}

function buildGuidePrompt(latinName, topicTitle, locale) {
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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function callClaude(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode !== 200) return reject(new Error(`Claude ${res.statusCode}: ${text}`));
          resolve(JSON.parse(text));
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractJSON(text) {
  const stripped = text.replace(/```json|```/g, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in Claude response');
  return JSON.parse(match[0]);
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(body);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
async function handleIdentify(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' });
  }

  const { base64, mediaType = 'image/jpeg', language = 'en' } = body;
  if (!base64) return send(res, 400, { error: 'base64 is required' });

  try {
    const claudeRes = await callClaude({
      model: MODEL,
      max_tokens: 1200,
      system: buildIdentifyPrompt(language),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: 'Identify this plant.' },
          ],
        },
      ],
    });

    const raw = claudeRes.content?.[0]?.text ?? '';
    const parsed = extractJSON(raw);

    send(res, 200, {
      name: parsed.name ?? 'Unknown Plant',
      scientificName: parsed.scientificName ?? 'N/A',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      watering: parsed.watering ?? '',
      light: parsed.light ?? '',
      temperature: parsed.temperature ?? '',
      toxicity: parsed.toxicity ?? '',
      funFact: parsed.funFact ?? '',
      guideTopics: Array.isArray(parsed.guideTopics) ? parsed.guideTopics : [],
    });
  } catch (e) {
    console.error('[/identify]', e.message);
    send(res, 500, { error: e.message });
  }
}

async function handleGuide(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' });
  }

  const { plantLatinName, topicId, language = 'en' } = body;
  if (!plantLatinName || !topicId) {
    return send(res, 400, { error: 'plantLatinName and topicId are required' });
  }

  const FALLBACK_TITLES = {
    watering: 'Watering', pruning: 'Pruning', propagation: 'Propagation',
    repotting: 'Repotting', fertilizing: 'Fertilizing', sunlight: 'Sunlight',
    temperature: 'Temperature', soil: 'Soil', commonProblems: 'Common Problems',
  };
  const topicTitle = body.topicTitle ?? FALLBACK_TITLES[topicId] ?? topicId;

  try {
    const claudeRes = await callClaude({
      model: MODEL,
      max_tokens: 1500,
      system: buildGuidePrompt(plantLatinName, topicTitle, language),
      messages: [
        {
          role: 'user',
          content: `Write the ${topicTitle} guide for ${plantLatinName}.`,
        },
      ],
    });

    const raw = claudeRes.content?.[0]?.text ?? '';
    const parsed = extractJSON(raw);

    send(res, 200, {
      title: parsed.title ?? topicTitle,
      seasonOrKeyFacts: parsed.seasonOrKeyFacts ?? '',
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      detailedText: parsed.detailedText ?? '',
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    });
  } catch (e) {
    console.error('[/guide]', e.message);
    send(res, 500, { error: e.message });
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    });
    return res.end();
  }
  if (req.method === 'POST' && req.url === '/identify') return handleIdentify(req, res);
  if (req.method === 'POST' && req.url === '/guide') return handleGuide(req, res);
  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿  PlantLens server → http://0.0.0.0:${PORT}`);
  console.log(`    POST /identify   plant identification`);
  console.log(`    POST /guide      topic deep-dive`);
});
