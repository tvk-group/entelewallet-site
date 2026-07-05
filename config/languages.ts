import languagesJson from "./languages.json";

export type LanguageCode =
  | "en" | "tr" | "de" | "fr" | "es" | "it" | "pt" | "nl" | "ar" | "ru"
  | "zh" | "ja" | "ko" | "hi" | "ur" | "id" | "ms" | "fa" | "el" | "bg"
  | "ro" | "pl" | "uk" | "az" | "ka";

export interface Language {
  code: LanguageCode;
  name: string;
  rtl: boolean;
}

export const languages = languagesJson as Language[];
export const languageCodes = languages.map((l) => l.code);
export const rtlLanguages: LanguageCode[] = ["ar", "fa", "ur"];
