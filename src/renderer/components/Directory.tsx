import {
  BreadcrumbProps,
  Button,
  ButtonGroup,
  ControlGroup,
  H2,
  InputGroup,
  NonIdealState,
  NumericInput,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import "./Directory.css";
import { SetState, useSerialState } from "../serial";
import { DatasetProduct, ProductTree } from "types/products";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
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
  setCreatingProduct?: (bool: boolean) => void;
}
function DirBar({ path, setPath, setCreatingProduct }: DirBarProps) {
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
          {setCreatingProduct && (
            <Button
              intent="success"
              icon="plus"
              text={lang.newProduct}
              onClick={() => {
                setCreatingProduct(true);
              }}
            />
          )}
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

const capitalize = (s: string) => s[0]!.toUpperCase() + s.slice(1);

interface InputWithListProps {
  name: string;
  value: string;
  setValue: (value: string) => void;
  list: JSX.Element[];
}
const InputWithList = ({ name, value, setValue, list }: InputWithListProps) => {
  return (
    <>
      <InputGroup
        placeholder={(lang as unknown as Record<string, string>)[`list${capitalize(name)}`]}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="on"
        list={`product-${name}-list`}
        fill
      />
      <datalist id={`product-${name}-list`}>{list}</datalist>
    </>
  );
};

function optionsBy<T>(list: T[], mapping: (t: T) => string): JSX.Element[] {
  return [...new Set(list.map(mapping))].map((i) => <option value={i} key={i} />);
}

interface CreateProductProps {
  list: DatasetProduct[];
  addProduct: (product: DatasetProduct) => void;
}
function CreateProduct({ list, addProduct }: CreateProductProps): JSX.Element {
  const [name, setName] = useSerialState("name", "", CreateProduct);
  const [unit, setUnit] = useSerialState("unit", "", CreateProduct);
  const [price, setPrice] = useSerialState("price", "", CreateProduct);

  const nextId = list.map((i) => i.id).reduce((a, b) => Math.max(a, b), 0) + 1;

  const [nameDatalist, unitDatalist] = useMemo(() => {
    const names = optionsBy(list, (i) => i.name);
    const units = optionsBy(list, (i) => i.unit);
    return [names, units];
  }, [list]);

  return (
    <div className="inner-content" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addProduct({
            id: nextId,
            name: name,
            category: "",
            unit: unit,
            price: "12.00",
          });
          setName("");
          setUnit("");
          setPrice("");
        }}
      >
        <ControlGroup vertical>
          <InputWithList name="name" value={name} setValue={setName} list={nameDatalist} />
          <InputWithList name="unit" value={unit} setValue={setUnit} list={unitDatalist} />
          <NumericInput
            placeholder={lang.listPrice}
            value={price}
            clampValueOnBlur={true}
            onValueChange={(_, str) => setPrice(str)}
            min={0}
            minorStepSize={null}
            stepSize={0.01}
            locale="en-US"
            leftIcon="euro"
            fill
          />
          <Button intent="success" type="submit" icon="plus" />
        </ControlGroup>
      </form>
    </div>
  );
}

export interface DirectoryProps {
  tree: ProductTree | null;
  list: DatasetProduct[] | null;
  addToListing?: (product: DatasetProduct) => void;
  addProduct?: (product: DatasetProduct) => void;
}
export default function Directory({ tree, list, addToListing, addProduct }: DirectoryProps): JSX.Element {
  const [path, setPath] = useSerialState(DIR_KEY, pathReset(), Directory);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const hasData = tree !== null && list !== null;

  let selectedProduct = undefined;
  let itemChoices = [] as [number, string][];
  let catChoices = [] as [string, number][];
  if (tree != null) {
    const treeNode = dig(tree, path.parts);
    if (path.selection !== null) {
      selectedProduct = treeNode.items.find((i) => i.name == path.selection);
    } else {
      itemChoices = treeNode.items.map((i) => [i.id, i.name]);
      catChoices = Object.keys(treeNode.categories).map((key) => [
        key,
        totalLeafItems(treeNode.categories[key]!),
      ]);
    }
  }

  return (
    <>
      {hasData || <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} intent="primary" />} />}
      {hasData && !creatingProduct && (
        <DirBar
          path={path}
          setPath={setPath}
          setCreatingProduct={addProduct ? setCreatingProduct : undefined}
        />
      )}
      {hasData && selectedProduct === undefined && !creatingProduct && (
        <div id="directory" className="inner-content">
          {catChoices.map(([name, numChildren]) => (
            <p
              className="category card clicky"
              key={pathKey(path, name)}
              onClick={() => setPath(pathAppend(name))}
            >
              {name}…<span className="number">({numChildren})</span>
            </p>
          ))}
          {catChoices.length > 0 && itemChoices.length > 0 && <hr className="separator" />}
          {itemChoices.map(([id, name]) => (
            <p className="card clicky" key={id} onClick={() => setPath(pathSelect(name))}>
              {name}
            </p>
          ))}
        </div>
      )}
      {hasData && selectedProduct !== undefined && !creatingProduct && (
        <ConfirmProduct product={selectedProduct} setPath={setPath} addToListing={addToListing} />
      )}
      {hasData && creatingProduct && addProduct && (
        <CreateProduct
          list={list}
          addProduct={(product) => {
            setPath(pathReset());
            setCreatingProduct(false);
            addProduct(product);
          }}
        />
      )}
    </>
  );
}
