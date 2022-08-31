import * as fs from "fs/promises";
import * as fsSync from "fs";
import { Cell, TextNode, Document } from "arbeix-ods/lib/node";
import copyAndModifyODS from "arbeix-ods/lib/ods";
import { Schema } from "types/ods";

function stemExt(path: string): [string, string] {
  const period = path.lastIndexOf(".");
  const stem = path.substring(0, period);
  const ext = path.substring(period + 1);
  return [stem, ext];
}

function filterCell(cell: Cell, schema: Schema, indexedSchema: Record<string, Schema>, seen: string[]) {
  cell.walk((i) => {
    if (!(i instanceof TextNode)) return;

    const match = i.text.match(/\$\{\{(.*?)(?::(.*?))?\}\}/);
    if (match === null) return;
    const key = match[1]!;
    const keyField = match[2];
    const useIndexed = (keyField && indexedSchema[key]) !== undefined;
    const repl =
      (useIndexed ? indexedSchema[key]?.[keyField!] : schema[key]) ?? (keyField ? [] : `?? ${key} ??`);

    if (Array.isArray(repl) && !useIndexed && !seen.includes(key)) {
      seen.push(key);
      for (let index = 0; index < repl.length; index++) {
        cell.table
          .insertRow(cell.rowIndex + 1 + index)
          .copyContentsFrom(cell.row)
          .forEachCell((c) => c.adjustFormulae(cell.rowIndex - 1, 1 + index))
          .forEachCell((c) => filterCell(c, schema, { [key]: repl[index]! }, seen));
      }
      cell.table.deleteRow(cell.row.rowIndex);
    }
    if (Array.isArray(repl)) return;

    if (typeof repl === "string") {
      i.text = repl;
    } else if (typeof repl === "number") {
      cell.setType("float").setAttrib("office:value", repl.toString());
      i.text = repl.toString();
    } else if ("email" in repl) {
      cell
        .clear()
        .addNode("text:p")
        .addNode("text:a")
        .setAttrib("xlink:href", `mailto:${repl.email}`)
        .setAttrib("xlink:type", "simple")
        .addText(repl.email);
    } else if ("date" in repl) {
      const [year, month, day] = repl.date;
      const pad = (num: number, places: number): string => num.toString().padStart(places, "0");
      cell
        .setType("date")
        .setAttrib("office:date-value", `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`)
        .clear();
      // } else if ("formula" in repl) {
      //   cell.setFormula(
      //     repl.formula.replaceAll("${{ROW}}", cell.rowIndex.toString()),
      //     repl.type
      //   );
    } else if ("exact" in repl) {
      cell.setType("float").setAttrib("office:value", repl.exact);
      i.text = repl.exact;
    }

    // console.dir(cell, { depth: null, customInspect: true });
  });
}

function modifyDocument(obj: Document, table: string, schema: Schema) {
  const tables = obj.spreadsheet().tables();
  const template = tables[table]!;
  const seen: string[] = [];
  template.forEachCell((cell) => filterCell(cell, schema, {}, seen));
}

export function odsExample(srcFile: string, table: string, schema: Schema) {
  const [stem, ext] = stemExt(srcFile);
  const targetFile = `${stem}.mod.${ext}`;

  return new Promise<string>((resolve, reject) => {
    fs.readFile(srcFile)
      .then((input) =>
        copyAndModifyODS(
          input,
          fsSync.createWriteStream(targetFile).on("finish", () => {
            resolve(targetFile);
          }),
          (obj) => modifyDocument(obj, table, schema)
        )
      )
      .catch(reject);
  });
}
