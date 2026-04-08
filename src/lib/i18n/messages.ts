import { ar } from "@/lib/i18n/dictionaries/ar";
import { en } from "@/lib/i18n/dictionaries/en";

export type Locale = "en" | "ar";

export const messages = {
  en,
  ar,
} as const;

/** Dot-path keys for leaf strings in the English dictionary (ar mirrors structure). */
type LeafKeys<T, Prefix extends string = ""> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : T[K] extends object
          ? LeafKeys<T[K], `${Prefix}${K}.`>
          : never;
    }[keyof T & string];

export type TranslationKey = LeafKeys<typeof en>;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function createTranslator(locale: Locale) {
  const table = messages[locale] as unknown as Record<string, unknown>;
  return function t(path: TranslationKey): string {
    return getNested(table, path) ?? path;
  };
}
