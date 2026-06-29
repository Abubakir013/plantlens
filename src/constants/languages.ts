export interface Language {
  code: string;
  nativeName: string;
  englishName: string;
  flag: string;
  isRTL: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', nativeName: 'English',           englishName: 'English',    flag: '🇬🇧', isRTL: false },
  { code: 'es', nativeName: 'Español',            englishName: 'Spanish',    flag: '🇪🇸', isRTL: false },
  { code: 'fr', nativeName: 'Français',           englishName: 'French',     flag: '🇫🇷', isRTL: false },
  { code: 'de', nativeName: 'Deutsch',            englishName: 'German',     flag: '🇩🇪', isRTL: false },
  { code: 'it', nativeName: 'Italiano',           englishName: 'Italian',    flag: '🇮🇹', isRTL: false },
  { code: 'pt', nativeName: 'Português',          englishName: 'Portuguese', flag: '🇵🇹', isRTL: false },
  { code: 'ru', nativeName: 'Русский',            englishName: 'Russian',    flag: '🇷🇺', isRTL: false },
  { code: 'zh', nativeName: '中文',               englishName: 'Chinese',    flag: '🇨🇳', isRTL: false },
  { code: 'ja', nativeName: '日本語',             englishName: 'Japanese',   flag: '🇯🇵', isRTL: false },
  { code: 'ko', nativeName: '한국어',             englishName: 'Korean',     flag: '🇰🇷', isRTL: false },
  { code: 'ar', nativeName: 'العربية',            englishName: 'Arabic',     flag: '🇸🇦', isRTL: true  },
  { code: 'hi', nativeName: 'हिन्दी',            englishName: 'Hindi',      flag: '🇮🇳', isRTL: false },
  { code: 'nl', nativeName: 'Nederlands',         englishName: 'Dutch',      flag: '🇳🇱', isRTL: false },
  { code: 'pl', nativeName: 'Polski',             englishName: 'Polish',     flag: '🇵🇱', isRTL: false },
  { code: 'tr', nativeName: 'Türkçe',             englishName: 'Turkish',    flag: '🇹🇷', isRTL: false },
  { code: 'sv', nativeName: 'Svenska',            englishName: 'Swedish',    flag: '🇸🇪', isRTL: false },
  { code: 'no', nativeName: 'Norsk',              englishName: 'Norwegian',  flag: '🇳🇴', isRTL: false },
  { code: 'da', nativeName: 'Dansk',              englishName: 'Danish',     flag: '🇩🇰', isRTL: false },
  { code: 'fi', nativeName: 'Suomi',              englishName: 'Finnish',    flag: '🇫🇮', isRTL: false },
  { code: 'cs', nativeName: 'Čeština',            englishName: 'Czech',      flag: '🇨🇿', isRTL: false },
  { code: 'sk', nativeName: 'Slovenčina',         englishName: 'Slovak',     flag: '🇸🇰', isRTL: false },
  { code: 'hu', nativeName: 'Magyar',             englishName: 'Hungarian',  flag: '🇭🇺', isRTL: false },
  { code: 'ro', nativeName: 'Română',             englishName: 'Romanian',   flag: '🇷🇴', isRTL: false },
  { code: 'bg', nativeName: 'Български',          englishName: 'Bulgarian',  flag: '🇧🇬', isRTL: false },
  { code: 'hr', nativeName: 'Hrvatski',           englishName: 'Croatian',   flag: '🇭🇷', isRTL: false },
  { code: 'sr', nativeName: 'Српски',             englishName: 'Serbian',    flag: '🇷🇸', isRTL: false },
  { code: 'uk', nativeName: 'Українська',         englishName: 'Ukrainian',  flag: '🇺🇦', isRTL: false },
  { code: 'el', nativeName: 'Ελληνικά',           englishName: 'Greek',      flag: '🇬🇷', isRTL: false },
  { code: 'he', nativeName: 'עברית',              englishName: 'Hebrew',     flag: '🇮🇱', isRTL: true  },
  { code: 'th', nativeName: 'ภาษาไทย',           englishName: 'Thai',       flag: '🇹🇭', isRTL: false },
  { code: 'vi', nativeName: 'Tiếng Việt',         englishName: 'Vietnamese', flag: '🇻🇳', isRTL: false },
  { code: 'id', nativeName: 'Bahasa Indonesia',   englishName: 'Indonesian', flag: '🇮🇩', isRTL: false },
  { code: 'ms', nativeName: 'Bahasa Melayu',      englishName: 'Malay',      flag: '🇲🇾', isRTL: false },
  { code: 'tl', nativeName: 'Filipino',           englishName: 'Filipino',   flag: '🇵🇭', isRTL: false },
  { code: 'bn', nativeName: 'বাংলা',             englishName: 'Bengali',    flag: '🇧🇩', isRTL: false },
  { code: 'ur', nativeName: 'اردو',              englishName: 'Urdu',       flag: '🇵🇰', isRTL: true  },
  { code: 'fa', nativeName: 'فارسی',             englishName: 'Persian',    flag: '🇮🇷', isRTL: true  },
  { code: 'sw', nativeName: 'Kiswahili',          englishName: 'Swahili',    flag: '🇰🇪', isRTL: false },
  { code: 'af', nativeName: 'Afrikaans',          englishName: 'Afrikaans',  flag: '🇿🇦', isRTL: false },
  { code: 'ca', nativeName: 'Català',             englishName: 'Catalan',    flag: '🏴󠁥󠁳󠁣󠁴󠁿', isRTL: false },
];

export const RTL_CODES = new Set(LANGUAGES.filter(l => l.isRTL).map(l => l.code));
