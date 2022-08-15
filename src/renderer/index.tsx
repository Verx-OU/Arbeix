import { FocusStyleManager } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";
import { locale } from "./locale";
import App from "./App";
import { readDataset } from "./products";

FocusStyleManager.onlyShowFocusOnTabs();

window.sessionStorage.removeItem("products");
readDataset()
  .then((i) => window.sessionStorage.setItem("products", JSON.stringify(i)))
  .then(() => window.dispatchEvent(new Event("set-products")))
  .catch((err) => console.error(err));

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);

window.electron.ipcRenderer.on("change-language", () => {
  const locales = [...Object.keys(locale)];
  const currentIndex = locales.indexOf(globalThis.lang.getLanguage()) ?? 0;
  const newIndex = (currentIndex + 1) % (locales.length - 1);
  const newLocale = locales[newIndex]!;
  console.log(globalThis.lang.getLanguage(), newLocale);
  window.localStorage.setItem("locale", newLocale);
  globalThis.lang.setLanguage(newLocale);
  window.dispatchEvent(new Event("set-locale"));
});
