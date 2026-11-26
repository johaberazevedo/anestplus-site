import type { ReportCell, ReportDocument } from "@/lib/institutional-billing-reports";

const width = 595;
const height = 842;
const left = 42;
const right = width - left;
const top = 798;
const bottom = 52;
const contentTop = top - 86;
const bodySize = 10;
const lineHeight = 14;
const detailHeaderHeight = 24;
// Courier e Courier-Bold avançam 0,6 ponto por unidade do tamanho da fonte, para cada glifo.
const glyphsPerLine = Math.floor((right - left) / (bodySize * 0.6));
const availableLines = (cursor: number) => Math.max(0, Math.floor((cursor - bottom) / lineHeight) + 1);
const extended = "€\0‚ƒ„…†‡ˆ‰Š‹Œ\0Ž\0\0‘’“”•–—˜™š›œ\0žŸ";

function hexText(value: string) {
  return Buffer.from(Array.from(value.normalize("NFC"), (character) => {
    const code = character.codePointAt(0)!;
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) return code;
    const index = extended.indexOf(character);
    return code > 126 && index >= 0 ? 128 + index : 63;
  })).toString("hex");
}

function wrap(value: string) {
  const words = value.normalize("NFC").trim().split(/\s+/u);
  const lines: string[] = [];
  let line = "";
  let used = 0;
  for (const word of words) {
    const glyphs = /[\uD800-\uDBFF]/.test(word) ? Array.from(word) : null;
    const count = glyphs?.length ?? word.length;
    if (used && used + 1 + count > glyphsPerLine) {
      lines.push(line);
      line = "";
      used = 0;
    }
    let offset = 0;
    while (count - offset > glyphsPerLine) {
      const end = offset + glyphsPerLine;
      lines.push(glyphs ? glyphs.slice(offset, end).join("") : word.slice(offset, end));
      offset = end;
    }
    const tail = glyphs ? glyphs.slice(offset).join("") : word.slice(offset);
    line = used ? `${line} ${tail}` : tail;
    used = (used ? used + 1 : 0) + count - offset;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

const integers = new Intl.NumberFormat("pt-BR");

function reportMoney(cents: string) {
  const signed = BigInt(cents);
  const absolute = signed < 0 ? -signed : signed;
  return `${signed < 0 ? "-" : ""}R$ ${integers.format(absolute / BigInt(100))},${String(absolute % BigInt(100)).padStart(2, "0")}`;
}

const display = (cell: ReportCell) => typeof cell === "object" ? reportMoney(cell.cents) : String(cell);

export function renderBillingPdf(document: ReportDocument) {
  const pages: string[][] = [];
  let content: string[] = [];
  let y = top;
  const text = (x: number, at: number, value: string, size = 10, font = "F1") =>
    content.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${at} Tm <${hexText(value)}> Tj ET`);
  const line = (at: number) => content.push(`0.8 0.82 0.78 RG ${left} ${at} m ${right} ${at} l S`);
  const linesPerDetailPage = availableLines(contentTop - detailHeaderHeight);

  function detailHeader() {
    text(left, y, "Procedimentos", 13, "F2");
    y -= detailHeaderHeight;
  }

  function startPage(details = false) {
    content = ["0.10 0.15 0.09 rg"];
    pages.push(content);
    text(left, top, "Anest+ Pro", 11, "F2");
    text(left, top - 29, document.title, 21, "F2");
    text(left, top - 49, document.subtitle, 11);
    line(top - 62);
    y = contentTop;
    if (details) detailHeader();
    text(right - 60, 29, `Página ${pages.length}`, 9);
  }

  function bodyLine(value: string, bold = false) {
    text(left, y, value, bodySize, bold ? "F4" : "F3");
    y -= lineHeight;
  }

  startPage();
  for (const { label, value } of document.summary) {
    for (const part of wrap(`${label}: ${display(value)}`)) {
      if (y < bottom) startPage();
      bodyLine(part, label === "Total da consulta");
    }
    y -= 4;
  }
  if (document.detail) {
    const { rows } = document.detail;
    function beginDetails(required: number) {
      if (availableLines(y - 12 - detailHeaderHeight) < required) startPage(true);
      else {
        y -= 12;
        detailHeader();
      }
    }
    if (!rows.length) {
      beginDetails(1);
      bodyLine("Nenhum procedimento no recorte da consulta.");
    }
    for (const [index, row] of rows.entries()) {
      const title = `${row[0]} · ${row[1] || "Procedimento sem nome"}`;
      const titleLines = wrap(title);
      const metadata = [
        ...wrap(`${row[2] || "Plano ausente"} · ${row[3] || "Anestesista indisponível"}`),
        ...wrap(`${row[5]}${row[6] === "" ? "" : ` · ${display(row[6])}`}${row[4] ? ` · ${row[4]}` : ""}`),
      ];
      const observation = row[7] ? wrap(`Observação: ${row[7]}`) : [];
      const fullHeight = titleLines.length + metadata.length + observation.length;
      const fitsOnOnePage = fullHeight <= linesPerDetailPage;
      let continuation = fitsOnOnePage ? [] : wrap(`Continuação · ${title}`);
      if (continuation.length >= linesPerDetailPage) {
        // Uma identificação maior que a área útil precisa de uma referência compacta nas continuações.
        const reference = `Item ${index + 1}`;
        titleLines.unshift(reference);
        continuation = [`Continuação · ${reference}`];
      }

      const required = fitsOnOnePage ? fullHeight
        : Math.min(linesPerDetailPage, titleLines.length + metadata.length + (observation.length ? 1 : 0));
      if (index === 0) beginDetails(required);
      else if (availableLines(y) < required) startPage(true);
      line(y + 9);

      const parts = [...titleLines, ...metadata, ...observation];
      for (const [partIndex, part] of parts.entries()) {
        if (y < bottom) {
          startPage(true);
          line(y + 9);
          for (const heading of continuation) bodyLine(heading, true);
        }
        bodyLine(part, partIndex < titleLines.length);
      }
      y -= 10;
    }
  }

  const fonts = ["Helvetica", "Helvetica-Bold", "Courier", "Courier-Bold"];
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${7 + i * 2} 0 R`).join(" ")}] >>`,
    ...fonts.map((name) => `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`),
  ];
  pages.forEach((commands, index) => {
    const stream = commands.join("\n") + "\n";
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${8 + index * 2} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    );
  });
  const chunks = ["%PDF-1.4\n"];
  let offset = chunks[0].length;
  const xref = ["0000000000 65535 f \n"];
  objects.forEach((object, index) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    offset += chunk.length;
    chunks.push(chunk);
  });
  chunks.push(`xref\n0 ${xref.length}\n${xref.join("")}trailer\n<< /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`);
  return Buffer.from(chunks.join(""), "ascii");
}
