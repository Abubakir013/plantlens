import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import tr from './locales/tr.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import cs from './locales/cs.json';
import sk from './locales/sk.json';
import hu from './locales/hu.json';
import ro from './locales/ro.json';
import bg from './locales/bg.json';
import hr from './locales/hr.json';
import sr from './locales/sr.json';
import uk from './locales/uk.json';
import el from './locales/el.json';
import he from './locales/he.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import tl from './locales/tl.json';
import bn from './locales/bn.json';
import ur from './locales/ur.json';
import fa from './locales/fa.json';
import sw from './locales/sw.json';
import af from './locales/af.json';
import ca from './locales/ca.json';

export type TranslationSchema = typeof en;

// Non-English locales may be missing newer keys; runtime falls back to en via getNestedValue.
export const translations = {
  en, es, fr, de, it, pt, ru, zh, ja, ko, ar, hi, nl, pl, tr, sv, no, da,
  fi, cs, sk, hu, ro, bg, hr, sr, uk, el, he, th, vi, id, ms, tl, bn, ur,
  fa, sw, af, ca,
} as unknown as Record<string, TranslationSchema>;

export const RTL_CODES = new Set(['ar', 'he', 'ur', 'fa']);

export const fallback = en;
