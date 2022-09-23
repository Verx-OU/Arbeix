import LocalizedStrings, { LocalizedStringsMethods } from "react-localization";
import * as locale from "../../assets/locale.json";

export { locale };

type LocaleKeys = typeof locale[typeof DEFAULT_LOCALE];
export interface IStrings extends LocaleKeys, LocalizedStringsMethods {}

export const DEFAULT_LOCALE = "en" as const;
export type Locales = keyof typeof locale;

type ExpectedLocales = {
  [DEFAULT_LOCALE]: LocaleKeys;
};

const assertLocale: Record<Locales, Partial<LocaleKeys>> & ExpectedLocales = { ...locale };
globalThis.lang = new LocalizedStrings(assertLocale as { [key in Locales]: IStrings });
globalThis.lang.setLanguage(window.localStorage.getItem("locale") ?? DEFAULT_LOCALE);
