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
