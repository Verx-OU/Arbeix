import { Button, ButtonGroup, ControlGroup, FileInput, InputGroup } from "@blueprintjs/core";
import { SetState, tryParseJSON, useSerialState } from "renderer/serial";
import { AggregateReplacement, EmailReplacement, Schema } from "types/ods";
import { DatasetProduct } from "types/products";

export function pushProductToDebugSchema(product: DatasetProduct) {
  const key = "@!/debug.proc.schema";
  const schema = tryParseJSON<Schema>(localStorage.getItem(key), {});
  const products = (schema["M"] ?? []) as AggregateReplacement;

  const newProductReplacement = {
    NIMI: product.name,
    MU: product.unit,
    MAHT: 1,
    HIND: product.price,
    KASUM: 0,
    MUUA: "Täitmata",
  };

  const modified: Schema = { ...schema, M: [...products, newProductReplacement] };
  localStorage.setItem(key, JSON.stringify(modified));
}

export default function Debug() {
  const [templatePath, setTemplatePath] = useSerialState("debug.proc.template", "");
  const [sheet, setSheet] = useSerialState("debug.proc.sheet", "");
  const [schema, setSchema] = useSerialState("debug.proc.schema", {} as Schema);
  const products = (schema["M"] ?? []) as AggregateReplacement;

  const FileInputWrapper = (props: { state: string; setState: SetState<string>; default: string }) => {
    return (
      <FileInput
        text={props.state === "" ? props.default : props.state}
        hasSelection={props.state !== ""}
        onInputChange={(event) => props.setState(event.currentTarget.files![0]!.path)}
      />
    );
  };

  return (
    <div
      id="debug"
      className="inner-content"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <FileInputWrapper default="template" state={templatePath} setState={setTemplatePath} />
      <InputGroup
        placeholder="Sheet"
        defaultValue={sheet}
        onChange={(event) => setSheet(event.target.value)}
      />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div>
          <ControlGroup vertical>
            {["HINNAPAKKUMINE_NR", "KLIENT_NIMI", "KLIENT_ETTEVOTE", "KLIENT_TELEFON", "KLIENT_OBJEKT"].map(
              (i) => (
                <InputGroup
                  key={i}
                  defaultValue={schema[i] as string}
                  placeholder={i}
                  onChange={(event) => setSchema((j) => ({ ...j, [i]: event.target.value }))}
                />
              )
            )}
            <InputGroup
              defaultValue={(schema["KLIENT_EKIRI"] as EmailReplacement)?.email}
              placeholder="KLIENT_EKIRI"
              onChange={(event) => setSchema((j) => ({ ...j, KLIENT_EKIRI: { email: event.target.value } }))}
            />
          </ControlGroup>
        </div>
        {products.map((i, j) => (
          <ControlGroup vertical key={j}>
            {["NIMI", "MU", "MAHT", "HIND", "KASUM", "MUUA"].map((k) => (
              <InputGroup
                key={k}
                defaultValue={i[k] as string}
                placeholder={`M:${k} (${j})`}
                onChange={(event) =>
                  setSchema((x) => {
                    (x["M"] as AggregateReplacement)[j] = {
                      ...i,
                      [k]: ["MAHT", "HIND", "KASUM"].includes(k)
                        ? parseInt(event.target.value)
                        : event.target.value,
                    };
                    return { ...x };
                  })
                }
              />
            ))}
          </ControlGroup>
        ))}
      </div>
      <ButtonGroup>
        <Button
          intent="warning"
          icon="double-chevron-right"
          onClick={() => {
            const today = new Date();
            const schemaWithDate: Schema = {
              ...schema,
              KUUPAEV: { date: [today.getFullYear(), today.getMonth(), today.getDate()] },
            };
            window.electron.ipcRenderer.invoke("proc", templatePath, sheet, schemaWithDate);
          }}
        />
        <Button
          intent="success"
          icon="plus"
          onClick={() => {
            setSchema((j) => ({ ...j, M: [...((schema["M"] as AggregateReplacement) ?? []), {}] }));
          }}
        />
        <Button
          intent="danger"
          icon="trash"
          onClick={() => {
            setSchema((j) => ({ ...j, M: [] }));
          }}
        />
      </ButtonGroup>
    </div>
  );
}
