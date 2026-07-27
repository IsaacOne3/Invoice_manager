import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfItem = {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  lineTotal: string;
};

export type InvoicePdfData = {
  companyName: string;
  companyActivity?: string;
  companyAddress?: string;
  documentType: string;
  internalReference: string;
  clientName?: string;
  officialNumber?: string | null;
  issueDate?: string | null;
  place?: string | null;
  reference?: string | null;
  note?: string | null;
  currency: string;
  totalHt: string;
  vatAmount: string;
  totalTtc: string;
  items: PdfItem[];
};

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 42;
const ink = rgb(0.08, 0.16, 0.14);
const muted = rgb(0.35, 0.42, 0.39);
const green = rgb(0.08, 0.34, 0.25);
const pale = rgb(0.94, 0.97, 0.95);
const gold = rgb(0.68, 0.46, 0.12);

function wrap(text: string, maxLength: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function generateInvoicePdf(data: InvoicePdfData) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const draft = !data.officialNumber || !data.issueDate;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let pageNumber = 1;

  function drawTableHeader() {
    page.drawRectangle({ x: margin, y: y - 22, width: pageWidth - margin * 2, height: 22, color: green });
    const labels = [
      ["DESCRIPTION", margin + 9],
      ["QTY", 365],
      ["UNIT", 405],
      ["UNIT PRICE HT", 445],
      ["TOTAL HT", 510],
    ] as const;
    labels.forEach(([label, x]) => page.drawText(label, { x, y: y - 15, size: 7, font: bold, color: rgb(1, 1, 1) }));
    y -= 22;
  }

  function addHeader() {
    page.drawText("COMMERCIAL DOCUMENTS", { x: margin, y, size: 9, font: bold, color: green });
    page.drawText(draft ? "DRAFT" : "INVOICE", { x: pageWidth - margin - 90, y: y - 1, size: 13, font: bold, color: draft ? gold : green });
    y -= 25;
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: green });
    y -= 25;
    page.drawText(data.companyName, { x: margin, y, size: 15, font: bold, color: ink });
    if (data.companyActivity) page.drawText(data.companyActivity, { x: margin, y: y - 17, size: 8.5, font: regular, color: muted });
    if (data.companyAddress) page.drawText(data.companyAddress, { x: margin, y: y - 31, size: 8.5, font: regular, color: muted });
    page.drawText(data.documentType, { x: pageWidth - margin - 150, y, size: 12, font: bold, color: ink });
    page.drawText(data.officialNumber ? "No. " + data.officialNumber : data.internalReference, { x: pageWidth - margin - 150, y: y - 18, size: 8.5, font: regular, color: muted });
    page.drawText(data.issueDate ? "Date: " + data.issueDate : "Date: To be assigned", { x: pageWidth - margin - 150, y: y - 32, size: 8.5, font: regular, color: muted });
    y -= 67;
    if (draft) {
      page.drawRectangle({ x: margin, y: y - 22, width: pageWidth - margin * 2, height: 22, color: rgb(1, 0.97, 0.89) });
      page.drawText("DRAFT - Number and date are not yet assigned.", { x: margin + 9, y: y - 15, size: 8.5, font: bold, color: gold });
      y -= 37;
    }
    page.drawRectangle({ x: margin, y: y - 48, width: pageWidth - margin * 2, height: 48, color: pale });
    page.drawText("BILL TO", { x: margin + 12, y: y - 15, size: 7.5, font: bold, color: muted });
    page.drawText(data.clientName || "Client to be assigned", { x: margin + 12, y: y - 32, size: 10, font: bold, color: ink });
    if (data.place || data.reference) page.drawText([data.place, data.reference].filter(Boolean).join(" · "), { x: pageWidth / 2, y: y - 32, size: 8.5, font: regular, color: muted });
    y -= 75;
    drawTableHeader();
  }

  function nextPage() {
    page.drawText("Page " + pageNumber, { x: pageWidth - margin - 35, y: 22, size: 7.5, font: regular, color: muted });
    pageNumber += 1;
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    addHeader();
  }

  addHeader();
  data.items.forEach((item, index) => {
    const descriptionLines = wrap(item.description, 44);
    const rowHeight = Math.max(28, descriptionLines.length * 11 + 13);
    if (y - rowHeight < 85) nextPage();
    if (index % 2 === 0) page.drawRectangle({ x: margin, y: y - rowHeight, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.98, 0.99, 0.98) });
    descriptionLines.forEach((line, lineIndex) => page.drawText(line, { x: margin + 9, y: y - 15 - lineIndex * 11, size: 8.5, font: regular, color: ink }));
    page.drawText(item.quantity, { x: 365, y: y - 15, size: 8.5, font: regular, color: ink });
    page.drawText(item.unit, { x: 405, y: y - 15, size: 8.5, font: regular, color: ink });
    page.drawText(item.unitPrice || "-", { x: 445, y: y - 15, size: 8.5, font: regular, color: ink });
    page.drawText(item.lineTotal, { x: 510, y: y - 15, size: 8.5, font: bold, color: ink });
    page.drawLine({ start: { x: margin, y: y - rowHeight }, end: { x: pageWidth - margin, y: y - rowHeight }, thickness: 0.4, color: rgb(0.82, 0.86, 0.83) });
    y -= rowHeight;
  });

  if (y < 180) nextPage();
  y -= 20;
  page.drawLine({ start: { x: 350, y }, end: { x: pageWidth - margin, y }, thickness: 0.8, color: green });
  y -= 18;
  [["TOTAL HT", data.totalHt], ["VAT", data.vatAmount], ["TOTAL TTC", data.totalTtc]].forEach(([label, value], index) => {
    page.drawText(label, { x: 390, y: y - index * 19, size: index === 2 ? 9 : 8, font: index === 2 ? bold : regular, color: muted });
    page.drawText(value + " " + data.currency, { x: 500, y: y - index * 19, size: index === 2 ? 9 : 8, font: bold, color: ink });
  });
  y -= 80;
  if (data.note) {
    page.drawText("NOTE", { x: margin, y, size: 7.5, font: bold, color: muted });
    wrap(data.note, 90).slice(0, 3).forEach((line, index) => page.drawText(line, { x: margin, y: y - 14 - index * 11, size: 8.5, font: regular, color: ink }));
  }
  page.drawText(draft ? "Draft document - not for final issue." : "Commercial document", { x: margin, y: 22, size: 7.5, font: regular, color: muted });
  page.drawText("Page " + pageNumber, { x: pageWidth - margin - 35, y: 22, size: 7.5, font: regular, color: muted });
  return pdf.save();
}
