import LocalizedStrings, { LocalizedStringsMethods } from "react-localization";
import * as locale from "../../assets/locale.json";

export { locale };

export const LOCALE_KEYS = [
  "tabHome",
  "tabTest",
  "tabDir",
  "tabList",
  "tabDebug",
  "goToHome",
  "back",
  "dirHeader",
  "dirPrefix",
  "dirProduct",
  "dirReload",
  "addProduct",
  "listName",
  "listUnit",
  "listPrice",
  "manageProducts",
] as const;
type LocaleKeys = Record<typeof LOCALE_KEYS[number], string>;
export interface IStrings extends LocaleKeys, LocalizedStringsMethods {}

export const DEFAULT_LOCALE = "en" as const;
export type Locales = keyof typeof locale;

type ExpectedLocales = {
  [DEFAULT_LOCALE]: LocaleKeys;
};

const assertLocale: Record<Locales, Partial<LocaleKeys>> & ExpectedLocales = { ...locale };
globalThis.lang = new LocalizedStrings(assertLocale as { [key in Locales]: IStrings });
globalThis.lang.setLanguage(window.localStorage.getItem("locale") ?? DEFAULT_LOCALE);
