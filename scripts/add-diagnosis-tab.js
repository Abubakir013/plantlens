const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '../src/i18n/locales');

const labels = {
  en: 'Diagnosis',
  es: 'Diagnóstico',
  fr: 'Diagnostic',
  de: 'Diagnose',
  it: 'Diagnosi',
  pt: 'Diagnóstico',
  ru: 'Диагностика',
  zh: '诊断',
  ja: '診断',
  ko: '진단',
  ar: 'تشخيص',
  hi: 'निदान',
  nl: 'Diagnose',
  pl: 'Diagnoza',
  tr: 'Tanı',
  sv: 'Diagnos',
  no: 'Diagnose',
  da: 'Diagnose',
  fi: 'Diagnoosi',
  cs: 'Diagnóza',
  sk: 'Diagnóza',
  hu: 'Diagnózis',
  ro: 'Diagnostic',
  bg: 'Диагноза',
  hr: 'Dijagnoza',
  sr: 'Дијагноза',
  uk: 'Діагностика',
  el: 'Διάγνωση',
  he: 'אבחון',
  th: 'วินิจฉัย',
  vi: 'Chẩn đoán',
  id: 'Diagnosis',
  ms: 'Diagnosis',
  tl: 'Diagnosis',
  bn: 'ডায়াগনসিস',
  ur: 'تشخیص',
  fa: 'تشخیص',
  sw: 'Uchunguzi',
  af: 'Diagnose',
  ca: 'Diagnosi',
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let updated = 0, skipped = 0, errors = 0;

for (const file of files) {
  const code = file.replace('.json', '');
  const fp = path.join(dir, file);

  try {
    let raw = fs.readFileSync(fp);
    // Strip BOM if present
    if (raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) raw = raw.slice(3);
    const obj = JSON.parse(raw.toString('utf8'));

    if (!obj.tabs) {
      console.log('SKIP (no tabs):', file);
      errors++;
      continue;
    }

    if (obj.tabs.diagnosis) {
      skipped++;
      continue;
    }

    obj.tabs.diagnosis = labels[code] || 'Diagnosis';

    const json = JSON.stringify(obj, null, 2);
    fs.writeFileSync(fp, json, { encoding: 'utf8' });
    updated++;
    console.log('Updated:', file, '->', obj.tabs.diagnosis);
  } catch (e) {
    console.log('ERROR in:', file, e.message);
    errors++;
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} already had key, ${errors} errors`);
