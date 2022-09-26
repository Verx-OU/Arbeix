export interface DatasetProduct {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: string;
}

export interface ProductTree {
  categories: Record<string, ProductTree>;
  items: DatasetProduct[];
}

export type ProductFile = [ProductTree, DatasetProduct[]];
