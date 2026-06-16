import type { APIRoute } from "astro";
import { requireAuth } from "@middleware/auth";
import { errorResponse } from "@utils/response";
import { AppError } from "@utils/errors";
import * as payrollService from "@modules/payrolls/services/payroll.service";

function n(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  return Number(v) || 0;
}

const HEADERS = [
  { key: "num", label: "Nº", w: 6 },
  { key: "nombre", label: "Nombres y Apellidos", w: 30 },
  { key: "cargo", label: "Cargo", w: 22 },
  { key: "cedula", label: "Cédula", w: 18 },
  { key: "inss", label: "Nº INSS", w: 16 },
  { key: "fingreso", label: "Fecha Ingreso", w: 16 },
  { key: "cuenta", label: "Nº Cuenta", w: 18 },
  { key: "salario", label: "Salario Mensual", w: 18, money: true },
  { key: "diaslab", label: "Días Laborados", w: 14, dec: true },
  { key: "salord", label: "Salario Ordinario", w: 18, money: true },
  { key: "hrsext", label: "Hrs Extras", w: 12, dec: true },
  { key: "mtohrsext", label: "Monto Hrs Extras", w: 18, money: true },
  { key: "dvac", label: "Días Vac Descanso", w: 16, dec: true },
  { key: "mtovac", label: "Monto Vac Descanso", w: 18, money: true },
  { key: "ingrav", label: "Ingreso Gravable", w: 18, money: true },
  { key: "ingnograv", label: "Ingreso No Gravable", w: 18, money: true },
  { key: "dsubmat", label: "Días Sub Maternidad", w: 16, dec: true },
  { key: "mtosubmat", label: "Monto Sub Maternidad", w: 18, money: true },
  { key: "mtosubest", label: "Subsidio Estatal", w: 16, money: true },
  { key: "totaling", label: "Total Ingreso", w: 16, money: true },
  { key: "hrsded", label: "Hrs Deducir", w: 14, dec: true },
  { key: "mtohrsded", label: "Monto Hrs Deducir", w: 18, money: true },
  { key: "insslab", label: "INSS Laboral", w: 14, money: true },
  { key: "ir", label: "IR", w: 14, money: true },
  { key: "deducc", label: "Deduc Varias", w: 14, money: true },
  { key: "totalded", label: "Total Deducciones", w: 18, money: true },
  { key: "neto", label: "Neto a Pagar", w: 16, money: true },
];

const headerFill = {
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb: "FF1F2937" },
};
const headerFont = { bold: true, size: 11, color: { argb: "FFFFFFFF" }, name: "Calibri" };
const headerAlign = { horizontal: "center" as const, vertical: "middle" as const, wrapText: true };
const thinBorder = {
  top: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
  left: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
  right: { style: "thin" as const, color: { argb: "FFD1D5DB" } },
};
const zebraFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF3F4F6" } };

export const GET: APIRoute = async ({ params, request }) => {
  try {
    await requireAuth({ request } as any);

    const { id } = params;
    if (!id) return errorResponse(new AppError("ID de planilla requerido", 400));

    const planilla = await payrollService.findById(Number(id));
    const workers = planilla.workers ?? [];

    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const safeName = planilla.nombre.substring(0, 25).replace(/[\\\/\[\]\*\?:]/g, "") || "Planilla";
    const ws = wb.addWorksheet(safeName);

    // Define columns
    ws.columns = HEADERS.map((h) => ({
      header: h.label,
      key: h.key,
      width: h.w,
      style: h.money ? { numFmt: '"C$"#,##0.00' } : h.dec ? { numFmt: '0.00' } : {},
    }));

    // Add rows
    for (let i = 0; i < workers.length; i++) {
      const w: any = workers[i];
      ws.addRow({
        num: i + 1,
        nombre: `${w.nombre} ${w.apellidos}`,
        cargo: w.cargo || "",
        cedula: w.cedulaIdentidad || "",
        inss: w.numeroInss || "",
        fingreso: w.fechaEntrada ? new Date(w.fechaEntrada).toLocaleDateString("es-ES") : "",
        cuenta: w.cuentaNomina || "",
        salario: n(w.salarioBase),
        diaslab: n(w.diasLaborados),
        salord: n(w.salarioOrdinario),
        hrsext: n(w.hrsExtras),
        mtohrsext: n(w.montoHrsExtras),
        dvac: n(w.diasVacDescanso),
        mtovac: n(w.montoVacDescanso),
        ingrav: n(w.ingresoGravable),
        ingnograv: n(w.ingresoNoGravable),
        dsubmat: n(w.diasSubMaternidad),
        mtosubmat: n(w.montoSubMaternidad),
        mtosubest: n(w.montoSubEstatal),
        totaling: n(w.totalIngreso),
        hrsded: n(w.hrsDeducir),
        mtohrsded: n(w.montoHrsDeducir),
        insslab: n(w.inssLaboral),
        ir: n(w.ir),
        deducc: n(w.deducVarias),
        totalded: n(w.totalDeducciones),
        neto: n(w.netoPagar),
      });
    }

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = headerAlign;
      cell.border = thinBorder;
    });

    // Style data rows
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.font = { size: 10, name: "Calibri" };
        if (i % 2 === 0) {
          cell.fill = zebraFill;
        }
        // Right-align numeric columns
        if (HEADERS[colNumber - 1]?.money || HEADERS[colNumber - 1]?.dec) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
      });
    }

    // Freeze header
    ws.views = [{ state: "frozen", ySplit: 1 }];

    // Auto-filter
    ws.autoFilter = { from: "A1", to: { row: ws.rowCount, column: HEADERS.length } };

    const buf = await wb.xlsx.writeBuffer();

    const dlName = planilla.nombre.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s_-]/g, "").trim() || "Planilla";

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(dlName)}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("Error al exportar planilla", 500, "INTERNAL_ERROR"));
  }
};
