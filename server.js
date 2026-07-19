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

function callClaude(payload, timeoutMs = 55000) {
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
          try {
            resolve(JSON.parse(text));
          } catch (parseErr) {
            reject(new Error(`Failed to parse Claude response: ${text.slice(0, 300)}`));
          }
        });
        res.on('error', reject);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Claude API timeout after ${timeoutMs}ms`));
    });
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

// ─── Diagnose prompt ─────────────────────────────────────────────────────────
const DIAGNOSE_BASE = `You are an expert plant pathologist and horticulturist. When given a plant image, respond with ONLY a valid JSON object — no markdown fences, no prose before or after. Use exactly this structure:
{
  "isPlant": true,
  "plantName": "Common Plant Name",
  "isHealthy": false,
  "healthScore": 45,
  "severity": "moderate",
  "diagnosis": {
    "problemName": "Root rot",
    "problemType": "disease",
    "confidence": 82,
    "visibleSymptoms": ["yellowing lower leaves", "wilting despite moist soil", "black stem base"]
  },
  "cause": {
    "summary": "Caused by overwatering and poor drainage, which creates anaerobic conditions that allow Phytophthora fungi to destroy roots.",
    "contributingFactors": ["soil staying wet for more than 3 days", "pot without drainage holes", "low light reducing transpiration"]
  },
  "treatment": {
    "urgency": "Act within 48 hours",
    "steps": [
      { "step": 1, "title": "Remove from pot", "detail": "Gently slide the plant out and shake off all old soil. Cut away any black, mushy roots with sterilized scissors.", "timeframe": "Today" },
      { "step": 2, "title": "Treat with fungicide", "detail": "Soak remaining roots in a solution of 1 tsp copper-based fungicide per 1 liter of water for 30 minutes.", "timeframe": "Today" },
      { "step": 3, "title": "Repot in fresh mix", "detail": "Use a fast-draining mix (50% perlite, 50% potting soil) in a pot with at least 2 drainage holes.", "timeframe": "Today" },
      { "step": 4, "title": "Withhold water", "detail": "Do not water for 7 days to allow roots to dry and recover. Resume with 50ml every 10 days.", "timeframe": "7 days" }
    ],
    "materialsNeeded": ["sterilized scissors", "copper fungicide", "fresh potting mix", "perlite", "pot with drainage holes"]
  },
  "prevention": {
    "summary": "Root rot is almost always preventable with proper watering discipline and drainage.",
    "tips": ["Always check soil dryness 5cm deep before watering", "Use pots with drainage holes only", "Empty saucers 30 minutes after watering", "Reduce watering by 50% in winter"]
  },
  "expectedRecovery": "3-4 weeks with proper treatment, assuming at least 30% of roots survive"
}
Rules:
- JSON keys stay in English exactly as shown.
- severity must be one of: "none", "mild", "moderate", "severe".
- problemType must be one of: "disease", "pest", "nutrient", "watering", "light", "environment".
- If the plant is healthy: set isHealthy=true, severity="none", healthScore 80-100, problemName="No problems detected", visibleSymptoms=[], cause.summary="Plant appears healthy", treatment.steps=[], and provide meaningful prevention tips.
- If no plant is visible in the image: return {"isPlant":false,"plantName":"","isHealthy":false,"healthScore":0,"severity":"none","diagnosis":{"problemName":"","problemType":"disease","confidence":0,"visibleSymptoms":[]},"cause":{"summary":"","contributingFactors":[]},"treatment":{"urgency":"","steps":[],"materialsNeeded":[]},"prevention":{"summary":"","tips":[]},"expectedRecovery":""}
- Treatment steps must be CONCRETE and ACTIONABLE: include exact amounts (milliliters, grams, percentages), specific product types, and clear actions. Never write vague advice like "water properly".`;

function buildDiagnosePrompt(locale) {
  const lang = langName(locale);
  if (lang === 'English') return DIAGNOSE_BASE;
  return (
    DIAGNOSE_BASE +
    `\nIMPORTANT: Translate ALL text VALUES into ${lang}. Keep every JSON key in English. Keep plantName and any scientific names in their standard form. The severity and problemType values must remain in English exactly as specified.`
  );
}

async function handleDiagnose(req, res) {
  const start = Date.now();
  console.log(`[/diagnose] ← request received`);

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: 'Invalid JSON body' });
  }

  const { image, language = 'en' } = body;
  if (!image) return send(res, 400, { error: 'image (base64) is required' });
  console.log(`[/diagnose] image=${image.length}chars lang=${language}`);

  const mediaType = body.mediaType ?? 'image/jpeg';

  try {
    const claudeRes = await callClaude({
      model: MODEL,
      max_tokens: 2000,
      system: buildDiagnosePrompt(language),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'Diagnose this plant. Is it healthy? If not, what is wrong and how do I fix it?' },
          ],
        },
      ],
    }, 55000);

    const raw = claudeRes.content?.[0]?.text ?? '';
    console.log(`[/diagnose] Claude replied in ${Date.now() - start}ms, raw (first 300): ${raw.slice(0, 300).replace(/\n/g, ' ')}`);
    const parsed = extractJSON(raw);

    console.log(`[/diagnose] ✓ done in ${Date.now() - start}ms`);
    send(res, 200, {
      isPlant:   typeof parsed.isPlant === 'boolean' ? parsed.isPlant : true,
      plantName: parsed.plantName ?? '',
      isHealthy: typeof parsed.isHealthy === 'boolean' ? parsed.isHealthy : false,
      healthScore: typeof parsed.healthScore === 'number' ? Math.min(100, Math.max(0, parsed.healthScore)) : 0,
      severity:   ['none','mild','moderate','severe'].includes(parsed.severity) ? parsed.severity : 'moderate',
      diagnosis: {
        problemName:     parsed.diagnosis?.problemName ?? '',
        problemType:     parsed.diagnosis?.problemType ?? 'disease',
        confidence:      typeof parsed.diagnosis?.confidence === 'number' ? parsed.diagnosis.confidence : 0,
        visibleSymptoms: Array.isArray(parsed.diagnosis?.visibleSymptoms) ? parsed.diagnosis.visibleSymptoms : [],
      },
      cause: {
        summary:              parsed.cause?.summary ?? '',
        contributingFactors:  Array.isArray(parsed.cause?.contributingFactors) ? parsed.cause.contributingFactors : [],
      },
      treatment: {
        urgency:          parsed.treatment?.urgency ?? '',
        steps:            Array.isArray(parsed.treatment?.steps) ? parsed.treatment.steps : [],
        materialsNeeded:  Array.isArray(parsed.treatment?.materialsNeeded) ? parsed.treatment.materialsNeeded : [],
      },
      prevention: {
        summary: parsed.prevention?.summary ?? '',
        tips:    Array.isArray(parsed.prevention?.tips) ? parsed.prevention.tips : [],
      },
      expectedRecovery: parsed.expectedRecovery ?? '',
    });
  } catch (e) {
    console.error(`[/diagnose] ✗ error after ${Date.now() - start}ms:`, e.message);
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
  if (req.method === 'POST' && req.url === '/diagnose') return handleDiagnose(req, res);
  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿  PlantLens server → http://0.0.0.0:${PORT}`);
  console.log(`    POST /identify   plant identification`);
  console.log(`    POST /guide      topic deep-dive`);
  console.log(`    POST /diagnose   plant health diagnosis`);
});
