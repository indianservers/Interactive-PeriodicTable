export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvText(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\r\n");
}
export function exportCsv(rows, filename) {
  downloadBlob(
    new Blob([csvText(rows)], { type: "text/csv;charset=utf-8" }),
    filename,
  );
}
// A compact text report with paginated, selectable text and correct byte offsets.
export function reportPdf(title, lines) {
  const ascii = (value) =>
    String(value)
      .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 8320))
      .replace(/°/g, " deg ")
      .replace(/[−–—]/g, "-")
      .replace(/[^\x20-\x7e]/g, " ");
  const wrapped = [title, "", ...lines].flatMap(
    (line) => ascii(line).match(/.{1,85}(?:\s|$)|.{1,85}/g) || [""],
  );
  const pages = [];
  for (let i = 0; i < wrapped.length; i += 46)
    pages.push(wrapped.slice(i, i + 46));
  const objects = [
    "",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const pageIds = [];
  pages.forEach((lines) => {
    const pageId = objects.length + 1,
      streamId = pageId + 1;
    pageIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`,
    );
    const content =
      "BT /F1 11 Tf 48 790 Td 16 TL\n" +
      lines
        .map((line) => `(${line.replace(/[\\()]/g, "\\$&")}) Tj T*`)
        .join("\n") +
      "\nET";
    objects.push(
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  let document = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(document.length);
    document += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
    .join(
      "",
    )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return new Blob([document], { type: "application/pdf" });
}
export function exportPdf(title, lines, filename) {
  downloadBlob(reportPdf(title, lines), filename);
}
