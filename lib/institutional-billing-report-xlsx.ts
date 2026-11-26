import { deflateRawSync } from "node:zlib";
import type { ReportCell, ReportDocument } from "@/lib/institutional-billing-reports";

const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const spreadsheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const office = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const packageRelations = "http://schemas.openxmlformats.org/package/2006/relationships";
const contentTypes = "http://schemas.openxmlformats.org/package/2006/content-types";
const sheetType = "application/vnd.openxmlformats-officedocument.spreadsheetml";
const xmlEscapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

function xml(value: string) {
  return value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "")
    .replace(/_(?=x[\da-f]{4}_)/gi, "_x005F_")
    .replace(/[&<>"']/g, (character) => xmlEscapes[character]);
}

function cell(reference: string, value: ReportCell, heading: boolean) {
  if (typeof value === "object") {
    const negative = value.cents.startsWith("-");
    const digits = (negative ? value.cents.slice(1) : value.cents).padStart(3, "0");
    const decimal = `${negative ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`;
    // O Excel mantém 15 algarismos significativos. Acima disso, conservar o valor exato como texto.
    if (digits.length <= 15) return `<c r="${reference}" s="2"><v>${decimal}</v></c>`;
    value = decimal.replace(".", ",");
  }
  if (typeof value === "number") return `<c r="${reference}"><v>${value}</v></c>`;
  // inlineStr mantém texto externo literal, inclusive valores que começam por "=".
  return `<c r="${reference}" t="inlineStr" s="${heading ? 1 : 3}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
}

function sheet(rows: ReportCell[][], widths: number[], headerRows: number[], detail: boolean) {
  const last = String.fromCharCode(64 + widths.length) + rows.length;
  const columns = widths.map((value, i) => `<col min="${i + 1}" max="${i + 1}" width="${value}" customWidth="1"/>`).join("");
  const body = rows.map((row, index) => {
    const heading = headerRows.includes(index);
    const cells = row.map((value, column) => cell(`${String.fromCharCode(65 + column)}${index + 1}`, value, heading)).join("");
    const lines = Math.max(1, ...row.map((value, column) => typeof value === "string"
      ? value.split("\n").reduce((sum, part) => sum + Math.max(1, Math.ceil(part.length / Math.max(1, widths[column] - 5))), 0) : 1));
    return `<row r="${index + 1}" ht="${Math.min(409, 6 + lines * 15)}" customHeight="1">${cells}</row>`;
  }).join("");
  return `<worksheet xmlns="${spreadsheet}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0">${detail
    ? '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' : ""}</sheetView></sheetViews>
    <sheetFormatPr defaultRowHeight="18"/><cols>${columns}</cols><sheetData>${body}</sheetData>${detail
    ? `<autoFilter ref="A1:${last}"/>` : ""}</worksheet>`;
}

const styles = `<styleSheet xmlns="${spreadsheet}">
<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00;[Red]-&quot;R$&quot; #,##0.00"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF243321"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  return crc >>> 0;
});

function zip(parts: Record<string, string>) {
  const local: Buffer[] = [];
  const directory: Buffer[] = [];
  let offset = 0;
  for (const [path, contents] of Object.entries(parts)) {
    const name = Buffer.from(path, "ascii");
    const data = Buffer.from(declaration + contents, "utf8");
    const packed = deflateRawSync(data);
    let crc = 0xffffffff;
    for (const byte of data) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];

    const common = Buffer.alloc(26);
    common.writeUInt16LE(20, 0);
    common.writeUInt16LE(8, 4);
    common.writeUInt16LE(33, 8); // 01/01/1980 na data DOS.
    common.writeUInt32LE((crc ^ 0xffffffff) >>> 0, 10);
    common.writeUInt32LE(packed.length, 14);
    common.writeUInt32LE(data.length, 18);
    common.writeUInt16LE(name.length, 22);
    const entry = Buffer.alloc(30);
    entry.writeUInt32LE(0x04034b50, 0);
    common.copy(entry, 4);
    const index = Buffer.alloc(46);
    index.writeUInt32LE(0x02014b50, 0);
    index.writeUInt16LE(20, 4);
    common.copy(index, 6);
    index.writeUInt32LE(offset, 42);
    local.push(entry, name, packed);
    directory.push(index, name);
    offset += entry.length + name.length + packed.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(directory.length / 2, 8);
  end.writeUInt16LE(directory.length / 2, 10);
  end.writeUInt32LE(directory.reduce((sum, buffer) => sum + buffer.length, 0), 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...directory, end]);
}

export function renderBillingXlsx(document: ReportDocument) {
  const tabs = document.detail ? ["Resumo", "Procedimentos"] : ["Resumo"];
  const sheets = tabs.map((_, index) => `worksheets/sheet${index + 1}.xml`);
  const summary = [[document.title, document.subtitle], ...document.summary.map(({ label, value }) => [label, value])];
  return zip({
    "[Content_Types].xml": `<Types xmlns="${contentTypes}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${sheetType}.sheet.main+xml"/>
      <Override PartName="/xl/styles.xml" ContentType="${sheetType}.styles+xml"/>${sheets.map((path) =>
      `<Override PartName="/xl/${path}" ContentType="${sheetType}.worksheet+xml"/>`).join("")}</Types>`,
    "_rels/.rels": `<Relationships xmlns="${packageRelations}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<workbook xmlns="${spreadsheet}" xmlns:r="${office}"><bookViews><workbookView/></bookViews><sheets>
      ${tabs.map((name, index) => `<sheet name="${name}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<Relationships xmlns="${packageRelations}">${sheets.map((path, index) =>
      `<Relationship Id="rId${index + 1}" Type="${office}/worksheet" Target="${path}"/>`).join("")}
      <Relationship Id="rIdStyles" Type="${office}/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": styles,
    "xl/worksheets/sheet1.xml": sheet(summary, [46, 65], [0], false),
    ...(document.detail ? { "xl/worksheets/sheet2.xml": sheet(
      [document.detail.header, ...document.detail.rows], [16, 34, 23, 26, 36, 16, 19, 48], [0], true,
    ) } : {}),
  });
}
