import { cookies } from "next/headers";

import type { Locale } from "@/lib/i18n/messages";
import { createTranslator } from "@/lib/i18n/messages";

const COOKIE = "NEXT_LOCALE";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  return v === "ar" ? "ar" : "en";
}

export async function getTranslator() {
  const locale = await getLocale();
  return { locale, t: createTranslator(locale) };
}

/** BCP 47 locale for `Date#toLocaleString` */
export function dateLocaleFor(locale: Locale): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}
