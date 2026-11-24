"use client";

import type { CommissionEntry, DriverReport, RiderReport } from "@/lib/types";
import { rangeLabel } from "@/lib/dates";

/**
 * PDF statements, built in the browser (jsPDF). The built-in PDF fonts
 * have no cedi sign, so amounts read "GHS 12.50" like the rider app's
 * receipts. Loaded on demand so the PDF library isn't in every page.
 */

const GREEN: [number, number, number] = [31, 168, 76];
const INK: [number, number, number] = [14, 26, 19];
const GRAY: [number, number, number] = [106, 117, 110];
const LIGHT: [number, number, number] = [242, 245, 243];

const ghs = (n: number | string | null | undefined) =>
  `GHS ${Number(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const dayTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const safe = (s: string) =>
  s
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

async function logoDataUrl(): Promise<string | null> {
  try {
    const blob = await (await fetch("/brand/logo.png")).blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function newDoc(title: string, subtitle: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const logo = await logoDataUrl();

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 6, "F");
  if (logo) doc.addImage(logo, "PNG", 40, 32, 106, 30);
  else {
    doc
      .setFont("helvetica", "bold")
      .setFontSize(20)
      .setTextColor(...GREEN);
    doc.text("Jamogo", 40, 55);
  }
  doc
    .setFont("helvetica", "bold")
    .setFontSize(16)
    .setTextColor(...INK);
  doc.text(title, W - 40, 46, { align: "right" });
  doc
    .setFont("helvetica", "normal")
    .setFontSize(10)
    .setTextColor(...GRAY);
  doc.text(subtitle, W - 40, 62, { align: "right" });

  return { doc, autoTable, W };
}

type Doc = Awaited<ReturnType<typeof newDoc>>;

/** Name, details and a short ID, under the header. */
function partyBlock(
  { doc, W }: Doc,
  label: string,
  name: string,
  lines: string[],
) {
  doc.setDrawColor(230, 234, 232).line(40, 82, W - 40, 82);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(8)
    .setTextColor(...GRAY);
  doc.text(label.toUpperCase(), 40, 102);
  doc
    .setFont("helvetica", "bold")
    .setFontSize(13)
    .setTextColor(...INK);
  doc.text(name, 40, 120);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(9.5)
    .setTextColor(...GRAY);
  lines.forEach((l, i) => doc.text(l, 40, 136 + i * 13));
  doc
    .setFontSize(8)
    .text(`Generated ${dayTime(new Date().toISOString())}`, W - 40, 102, {
      align: "right",
    });
}

/** A row of headline numbers in light boxes. */
function tiles({ doc, W }: Doc, y: number, items: [string, string][]) {
  const gap = 10;
  const w = (W - 80 - gap * (items.length - 1)) / items.length;
  items.forEach(([label, value], i) => {
    const x = 40 + i * (w + gap);
    doc.setFillColor(...LIGHT).roundedRect(x, y, w, 52, 6, 6, "F");
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(...GRAY);
    doc.text(label, x + 12, y + 19);
    doc
      .setFont("helvetica", "bold")
      .setFontSize(13)
      .setTextColor(...INK);
    doc.text(value, x + 12, y + 39);
  });
  return y + 52;
}

function heading({ doc }: Doc, y: number, text: string) {
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...INK);
  doc.text(text, 40, y);
  return y + 8;
}

const tableStyle = {
  styles: {
    font: "helvetica",
    fontSize: 8.5,
    textColor: INK,
    cellPadding: 5,
    lineColor: [230, 234, 232] as [number, number, number],
  },
  headStyles: {
    fillColor: LIGHT,
    textColor: GRAY,
    fontStyle: "bold" as const,
    fontSize: 7.5,
  },
  alternateRowStyles: {
    fillColor: [250, 251, 250] as [number, number, number],
  },
  margin: { left: 40, right: 40 },
};

function lastY(doc: Doc["doc"]) {
  return (
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 0
  );
}

function footer({ doc, W }: Doc, note: string) {
  const pages = doc.getNumberOfPages();
  const H = doc.internal.pageSize.getHeight();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(230, 234, 232).line(40, H - 46, W - 40, H - 46);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .setTextColor(...GRAY);
    doc.text(doc.splitTextToSize(note, W - 160), 40, H - 32);
    doc.text(`Page ${p} of ${pages}`, W - 40, H - 32, { align: "right" });
  }
}

const ENTRY_LABEL: Record<CommissionEntry["type"], string> = {
  charge: "Commission on a trip",
  payment: "Paid by MoMo",
  waiver: "Cleared by Jamogo",
};

/** A driver's commission statement for a period: what they owed, were charged, paid, and owe now. */
export async function downloadDriverStatement(report: DriverReport) {
  const d = await newDoc("Commission statement", rangeLabel(report.range));
  const { doc, autoTable } = d;
  const { driver, statement: s, summary } = report;
  const p = driver.driverProfile;
  partyBlock(d, "Driver", driver.name, [
    [driver.phone, p?.plateNumber && `Plate ${p.plateNumber}`]
      .filter(Boolean)
      .join("  ·  "),
    `Driver ID ${driver.id.slice(0, 8)}`,
  ]);

  let y = tiles(d, 178, [
    ["Trips completed", String(summary.trips)],
    ["Fares collected", ghs(summary.fares)],
    ["Commission charged", ghs(s.charged)],
    ["Owed at the end", ghs(s.closing)],
  ]);

  y = heading(d, y + 30, "Statement");
  autoTable(doc, {
    ...tableStyle,
    startY: y + 4,
    head: [["", { content: "Amount", styles: { halign: "right" } }]],
    body: [
      ["Owed at the start of the period", ghs(s.opening)],
      ["+ Commission charged on trips", ghs(s.charged)],
      ["- Paid by MoMo", ghs(s.paid)],
      ["- Cleared by Jamogo", ghs(s.waived)],
    ],
    foot: [
      [
        "Owed at the end of the period",
        { content: ghs(s.closing), styles: { halign: "right" } },
      ],
    ],
    footStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: { 1: { halign: "right", cellWidth: 120 } },
  });

  y = heading(d, lastY(doc) + 28, `Trips (${report.trips.length})`);
  autoTable(doc, {
    ...tableStyle,
    startY: y + 4,
    head: [
      [
        "Completed",
        "Route",
        "Riders",
        { content: "Fares collected", styles: { halign: "right" } },
      ],
    ],
    body: report.trips.length
      ? report.trips.map((t) => [
          dayTime(t.completedAt),
          `${t.pickupLabel} to ${t.destinationLabel || "..."}`,
          t.shared ? `${t.riders} (shared)` : String(t.riders),
          ghs(t.fares),
        ])
      : [["", "No trips in this period", "", ""]],
    columnStyles: {
      0: { cellWidth: 92 },
      2: { cellWidth: 62 },
      3: { halign: "right", cellWidth: 92 },
    },
  });

  const entries = report.entries.filter(
    (e) => e.type !== "payment" || e.status === "completed",
  );
  y = heading(d, lastY(doc) + 28, "Commission ledger");
  autoTable(doc, {
    ...tableStyle,
    startY: y + 4,
    head: [
      [
        "Date",
        "Entry",
        "Note",
        { content: "Amount", styles: { halign: "right" } },
      ],
    ],
    body: entries.length
      ? entries.map((e) => [
          day(e.createdAt),
          ENTRY_LABEL[e.type],
          e.note ?? "",
          `${e.type === "charge" ? "+" : "-"}${ghs(e.amount)}`,
        ])
      : [["", "No commission entries in this period", "", ""]],
    columnStyles: {
      0: { cellWidth: 80 },
      3: { halign: "right", cellWidth: 92 },
    },
  });

  footer(
    d,
    "Riders pay drivers directly in cash or MoMo. Commission is Jamogo's share of those fares, and can be paid by MoMo in the driver app.",
  );
  doc.save(
    `Jamogo-statement-${safe(driver.name)}-${report.range.from}-to-${report.range.to}.pdf`,
  );
}

/** A rider's trips for a period, with what they paid on each. */
export async function downloadRiderHistory(report: RiderReport) {
  const d = await newDoc("Trip history", rangeLabel(report.range));
  const { doc, autoTable } = d;
  const { rider, summary } = report;
  partyBlock(d, "Rider", rider.name, [
    rider.phone,
    `Rider ID ${rider.id.slice(0, 8)}`,
  ]);

  let y = tiles(d, 178, [
    ["Trips taken", String(summary.trips)],
    ["Total paid", ghs(summary.spent)],
    ["Average fare", ghs(summary.averageFare)],
    ["Shared rides", String(summary.sharedRides)],
  ]);

  y = heading(d, y + 30, `Trips (${report.trips.length})`);
  autoTable(doc, {
    ...tableStyle,
    startY: y + 4,
    head: [
      [
        "Completed",
        "Route",
        "Driver",
        { content: "Paid", styles: { halign: "right" } },
      ],
    ],
    body: report.trips.length
      ? report.trips.map((t) => [
          dayTime(t.completedAt),
          `${t.pickupLabel} to ${t.destinationLabel || "..."}${t.joined ? " (joined)" : t.shared ? " (shared)" : ""}`,
          t.driver?.name ?? "",
          ghs(t.paid),
        ])
      : [["", "No trips in this period", "", ""]],
    columnStyles: {
      0: { cellWidth: 92 },
      3: { halign: "right", cellWidth: 80 },
    },
  });

  footer(
    d,
    "Fares are paid to the driver in cash or MoMo. On a shared ride each rider pays their own share.",
  );
  doc.save(
    `Jamogo-trips-${safe(rider.name)}-${report.range.from}-to-${report.range.to}.pdf`,
  );
}
