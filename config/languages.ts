import languagesJson from "./languages.json";

export type LanguageCode =
  | "en" | "tr" | "de" | "fr" | "it" | "es" | "nl" | "pl" | "pt" | "ro"
  | "sv" | "da" | "fi" | "cs" | "sk" | "hu" | "el" | "bg" | "ru" | "uk"
  | "ar" | "zh" | "ja" | "ko" | "hi";

export interface Language {
  code: LanguageCode;
  name: string;
  rtl: boolean;
}

export const languages = languagesJson as Language[];
export const languageCodes = languages.map((l) => l.code);
export const rtlLanguages: LanguageCode[] = ["ar"];
