import { DatasetProduct, ProductTree } from "types/products";

export async function readDataset() {
  return window.electron.ipcRenderer.invoke("read-user-data", "product.csv") as Promise<
    [ProductTree, DatasetProduct[]]
  >;
}

export async function patchDataset(productList: DatasetProduct[]) {
  discardLocalProducts();
  const set = window.electron.ipcRenderer.invoke(
    "set-user-data",
    "product.csv",
    productList
  ) as Promise<null>;
  return set.then(() => fetchRemoteProducts());
}

export function discardLocalProducts() {
  window.sessionStorage.removeItem("products");
  window.sessionStorage.removeItem("product-list");
  window.dispatchEvent(new Event("set-products"));
}

export function fetchRemoteProducts() {
  readDataset()
    .then((i) => {
      window.sessionStorage.setItem("products", JSON.stringify(i[0]));
      window.sessionStorage.setItem("product-list", JSON.stringify(i[1]));
      return null;
    })
    .then(() => window.dispatchEvent(new Event("set-products")))
    .catch((err) => console.error(err));
}

export function updateLocalProducts() {
  discardLocalProducts();
  fetchRemoteProducts();
}
