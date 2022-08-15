import { ProductTree } from "common/products";

export async function readDataset() {
  return window.electron.ipcRenderer.invoke("read-user-data", "product.csv") as Promise<ProductTree>;
}
