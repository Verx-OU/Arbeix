import { Button, ButtonGroup, ControlGroup, FileInput, InputGroup, Pre } from "@blueprintjs/core";
import { useEffect } from "react";
import { SetStatePromise, useSerialState, useSessionState } from "renderer/serial";

type Replacements = Record<string, string>;

export default function Debug() {
  const [procPath, setProcPath] = useSerialState("debug.proc.proc", "");
  const [templatePath, setTemplatePath] = useSerialState("debug.proc.template", "");
  const [logHistory, setLogHistory] = useSessionState("debug.proc.log", [] as [number, string][]);
  const [replacements, setReplacements] = useSerialState("debug.proc.replace", {} as Replacements);

  useEffect(() => {
    const addLine = (event: Event) =>
      setLogHistory((i) => [...i, [Date.now() + i.length, (event as CustomEvent<string>).detail]]);
    window.addEventListener("cross-log", addLine);
    return () => window.removeEventListener("cross-log", addLine);
  }, [setLogHistory]);

  const FileInputWrapper = (props: { state: string; setState: SetStatePromise<string>; default: string }) => {
    return (
      <FileInput
        text={props.state === "" ? props.default : props.state}
        hasSelection={props.state !== ""}
        onInputChange={(event) => props.setState(event.currentTarget.files![0]!.path)}
      />
    );
  };

  return (
    <div id="debug" className="inner-content">
      <ControlGroup vertical>
        <FileInputWrapper default="proc" state={procPath} setState={setProcPath} />
        <FileInputWrapper default="template" state={templatePath} setState={setTemplatePath} />
        {["CL_TEL", "CL_NAME", "CL_OBJ", "NR", "CL_COMPANY", "CL_MAIL"].map((i) => (
          <InputGroup
            key={i}
            defaultValue={replacements[i]!}
            placeholder={i}
            onChange={(event) => setReplacements((j) => ({ ...j, [i]: event.target.value }))}
          />
        ))}
        <ButtonGroup fill>
          <Button
            intent="warning"
            icon="double-chevron-right"
            onClick={() => {
              setLogHistory([]);
              window.electron.ipcRenderer.invoke(
                "proc",
                procPath,
                templatePath,
                JSON.stringify(replacements)
              );
            }}
          />
          <Button
            intent="danger"
            icon="trash"
            onClick={() => {
              setLogHistory([]);
            }}
          />
        </ButtonGroup>
      </ControlGroup>

      <hr />

      {logHistory.map(([j, i]) => (
        <Pre style={{ padding: 0, margin: 0 }} key={j}>
          {i}
        </Pre>
      ))}
    </div>
  );
}
