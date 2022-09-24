import {
  BreadcrumbProps,
  Button,
  ButtonGroup,
  H2,
  InputGroup,
  NonIdealState,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import "./Directory.css";
import { SetState, useSerialState } from "../serial";
import { DatasetProduct, ProductTree } from "types/products";
import { Dispatch, SetStateAction } from "react";
import { Breadcrumbs2 } from "@blueprintjs/popover2";
import { useNavigate } from "react-router-dom";
import { updateLocalProducts } from "renderer/products";

const DIR_KEY = "dir.path";

const EMPTY_PRODUCT_TREE: Readonly<ProductTree> = { categories: {}, items: [] };

function dig(data: ProductTree, path: string[]): Readonly<ProductTree> {
  let ref = data;
  for (const i of path.filter((i) => i !== "")) {
    ref = ref.categories[i] ?? EMPTY_PRODUCT_TREE;
  }
  return ref;
}

function totalLeafItems(root: ProductTree): number {
  return Object.keys(root.categories)
    .map((i) => root.categories[i]!)
    .reduce((sum, i) => sum + totalLeafItems(i), root.items.length);
}

interface Path {
  parts: string[];
  selection: string | null;
}

const pathPopTo =
  (index: number) =>
  (path: Path): Path => ({
    parts: path.parts.slice(0, index + 1),
    selection: null,
  });
const pathAppend =
  (elem: string) =>
  (path: Path): Path => ({ parts: [...path.parts, elem], selection: null });
const pathSelect =
  (selection: string | null) =>
  (path: Path): Path => ({ parts: path.parts, selection: selection });
const pathKey = (path: Path, append: unknown): string => [...path.parts, path.selection, append].join("/");

const pathReset = (): Path => ({ parts: [], selection: null });

interface DirBarProps {
  path: Path;
  setPath: Dispatch<SetStateAction<Path>>;
}
function DirBar({ path, setPath }: DirBarProps) {
  const breadcrumbs: BreadcrumbProps[] = [];
  breadcrumbs.push({ text: lang.dirHeader, icon: "star", onClick: () => setPath(pathReset) });
  path.parts.forEach((i, j) =>
    breadcrumbs.push({ text: i, icon: "folder-close", onClick: () => setPath(pathPopTo(j)) })
  );
  if (path.selection !== null) breadcrumbs.push({ text: path.selection, icon: "document" });

  return (
    <div id="dir-navbar" className="top-bar">
      <Breadcrumbs2 items={breadcrumbs} />
      {breadcrumbs.length === 1 && (
        <ButtonGroup className="right">
          <Button intent="success" icon="plus" text={lang.newProduct} />
          <Button intent="danger" icon="refresh" onClick={() => updateLocalProducts()} />
        </ButtonGroup>
      )}
    </div>
  );
}

interface ConfirmProductProps {
  product: DatasetProduct;
  setPath: SetState<Path>;
  addToListing?: (product: DatasetProduct) => void;
}
function ConfirmProduct({ product, setPath, addToListing }: ConfirmProductProps) {
  const navigate = useNavigate();

  return (
    <>
      {addToListing && (
        <div id="dir-navbar" className="top-bar">
          <Button
            intent="success"
            text={lang.addProduct}
            large
            icon="tick"
            onClick={async () => {
              setPath(pathReset());
              addToListing(product);
              navigate(-1);
            }}
          />
        </div>
      )}
      <div id="directory-product" className="inner-content">
        <H2 title={product.id.toString()}>
          {lang.dirProduct} {product.name}
        </H2>
        <p>{product.unit}</p>
        <p>{product.price}</p>
      </div>
    </>
  );
}

interface CreateProductProps {
  addProduct: (product: DatasetProduct) => void;
}
function CreateProduct({ addProduct }: CreateProductProps): JSX.Element {
  return <InputGroup></InputGroup>;
}

export interface DirectoryProps {
  products: ProductTree | null;
  addToListing?: (product: DatasetProduct) => void;
}
export default function Directory({ products, addToListing }: DirectoryProps): JSX.Element {
  const [path, setPath] = useSerialState(DIR_KEY, pathReset(), Directory);

  const hasData = products !== null;

  let selectedProduct = undefined;
  let itemChoices = [] as string[];
  let catChoices = [] as [string, number][];
  if (products != null) {
    const treeNode = dig(products, path.parts);
    if (path.selection !== null) {
      selectedProduct = treeNode.items.find((i) => i.name == path.selection);
    } else {
      itemChoices = treeNode.items.map((i) => i.name);
      catChoices = Object.keys(treeNode.categories).map((key) => [
        key,
        totalLeafItems(treeNode.categories[key]!),
      ]);
    }
  }

  return (
    <>
      {hasData || <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} intent="primary" />} />}
      {hasData && <DirBar {...{ path, setPath }} />}
      {hasData && selectedProduct === undefined && (
        <div id="directory" className="inner-content">
          {catChoices.map((i) => (
            <p
              className="category card clicky"
              key={pathKey(path, i)}
              onClick={() => setPath(pathAppend(i[0]))}
            >
              {i[0]}…<span className="number">({i[1]})</span>
            </p>
          ))}
          {catChoices.length > 0 && itemChoices.length > 0 && <hr className="separator" />}
          {itemChoices.map((i) => (
            <p className="card clicky" key={pathKey(path, i)} onClick={() => setPath(pathSelect(i))}>
              {i}
            </p>
          ))}
        </div>
      )}
      {hasData && selectedProduct !== undefined && (
        <ConfirmProduct product={selectedProduct} setPath={setPath} addToListing={addToListing} />
      )}
    </>
  );
}
