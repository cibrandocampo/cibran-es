import en from "./en.json";
import es from "./es.json";
import gl from "./gl.json";

type Locale = "en" | "es" | "gl";

const translations = { en, es, gl } as const;

/**
 * Returns the value at `key` for the given locale.
 * Key uses dot notation: e.g. 'nav.about', 'meta.title'
 */
export function t(locale: Locale, key: string): string {
  const dict = translations[locale] as Record<string, unknown>;
  const value = key.split(".").reduce<unknown>((obj, k) => {
    if (obj && typeof obj === "object")
      return (obj as Record<string, unknown>)[k];
    return undefined;
  }, dict);
  if (typeof value === "string") return value;
  // Fallback to English if key is missing in the requested locale
  const fallback = key.split(".").reduce<unknown>(
    (obj, k) => {
      if (obj && typeof obj === "object")
        return (obj as Record<string, unknown>)[k];
      return undefined;
    },
    translations.en as Record<string, unknown>,
  );
  return typeof fallback === "string" ? fallback : key;
}

/**
 * Returns all three locale strings for a given key.
 * Spread directly into Tr props: <Tr {...tAll('section.about')} />
 */
export function tAll(key: string): { en: string; es: string; gl: string } {
  return { en: t("en", key), es: t("es", key), gl: t("gl", key) };
}

export type Localized = string | { en: string; es: string; gl: string };

/**
 * Normalises a content value that may be a plain string (same text in every
 * locale) or an inline `{ en, es, gl }` object. Spread into Tr props.
 */
export function loc(value: Localized): { en: string; es: string; gl: string } {
  return typeof value === "string"
    ? { en: value, es: value, gl: value }
    : value;
}

const MONTHS = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  es: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sept",
    "oct",
    "nov",
    "dic",
  ],
  gl: [
    "xan",
    "feb",
    "mar",
    "abr",
    "maio",
    "xuño",
    "xul",
    "ago",
    "set",
    "out",
    "nov",
    "dec",
  ],
} as const;

const PRESENT = { en: "Present", es: "Actualidad", gl: "Actualidade" } as const;

/** "2025-07" → "Jul 2025" (per locale); null/undefined end → "Present". */
export function formatPeriod(
  start: string,
  end?: string | null,
): { en: string; es: string; gl: string } {
  const fmt = (ym: string, l: Locale) => {
    const [y, m] = ym.split("-").map(Number);
    return m ? `${MONTHS[l][m - 1]} ${y}` : `${y}`;
  };
  const out = {} as { en: string; es: string; gl: string };
  for (const l of ["en", "es", "gl"] as const) {
    out[l] = `${fmt(start, l)} – ${end ? fmt(end, l) : PRESENT[l]}`;
  }
  return out;
}

/** Localises the word "Present" inside a company-level period like "2022 – Present". */
export function localisePeriod(period: string): {
  en: string;
  es: string;
  gl: string;
} {
  return {
    en: period,
    es: period.replace("Present", PRESENT.es),
    gl: period.replace("Present", PRESENT.gl),
  };
}
