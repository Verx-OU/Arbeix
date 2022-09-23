import { Button, ButtonGroup, ControlGroup, FileInput, InputGroup } from "@blueprintjs/core";
import { SetState, useSerialState } from "renderer/serial";
import { AggregateReplacement, EmailReplacement, Schema } from "types/ods";

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
      <InputGroup defaultValue={sheet} onChange={(event) => setSheet(event.target.value)} />
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
            window.electron.ipcRenderer.invoke("proc", templatePath, sheet, schema);
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
