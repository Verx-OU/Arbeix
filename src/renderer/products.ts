import { ProductTree } from "common/products";

export async function readDataset() {
  return window.electron.ipcRenderer.invoke("read-user-data", "product.csv") as Promise<ProductTree>;
}

export function updateLocalProducts() {
  window.sessionStorage.removeItem("products");
  window.dispatchEvent(new Event("set-products"));
  readDataset()
    .then((i) => window.sessionStorage.setItem("products", JSON.stringify(i)))
    .then(() => window.dispatchEvent(new Event("set-products")))
    .catch((err) => console.error(err));
}
