import { jsPDF } from "jspdf";
import { ValidationError } from "@utils/errors";
import type {
  CreateEsquelaDTO,
  UpdateEsquelaDTO,
  EsquelaResponse,
  EsquelaFilters,
  PaginatedResult,
} from "../types";
import { EstadoPermiso } from "../types";
import * as repository from "../repositories/permits.repository";

const VALID_TRANSITIONS: Record<EstadoPermiso, EstadoPermiso[]> = {
  [EstadoPermiso.PENDIENTE]: [EstadoPermiso.APROBADA, EstadoPermiso.RECHAZADA],
  [EstadoPermiso.APROBADA]: [],
  [EstadoPermiso.RECHAZADA]: [],
};

function validateStateTransition(
  current: EstadoPermiso,
  next: EstadoPermiso,
): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new ValidationError(
      `No se puede cambiar el estado de "${current}" a "${next}". Solo permisos en estado "pendiente" pueden ser aprobados o rechazados.`,
    );
  }
}

export async function findAll(
  filters: EsquelaFilters = {},
): Promise<PaginatedResult<EsquelaResponse>> {
  return repository.findAll(filters);
}

export async function findById(id: number): Promise<EsquelaResponse> {
  return repository.findById(id);
}

export async function create(data: CreateEsquelaDTO): Promise<EsquelaResponse> {
  if (!data.trabajadorId) throw new ValidationError("El trabajador es requerido");
  if (!data.tipoPermisoId) throw new ValidationError("El tipo de permiso es requerido");
  if (!data.ubicacion) throw new ValidationError("La ubicación es requerida");
  if (!data.cantidadDias || data.cantidadDias < 1)
    throw new ValidationError("La cantidad de días debe ser mayor a 0");
  if (!data.periodoCorrespondiente)
    throw new ValidationError("El periodo correspondiente es requerido");
  if (!data.fechaIncorporacion)
    throw new ValidationError("La fecha de incorporación es requerida");

  return repository.create(data);
}

export async function update(
  id: number,
  data: UpdateEsquelaDTO,
): Promise<EsquelaResponse> {
  const existing = await repository.findById(id);

  if (existing.estado !== EstadoPermiso.PENDIENTE) {
    throw new ValidationError(
      "Solo se pueden modificar permisos en estado pendiente",
    );
  }

  return repository.update(id, data);
}

export async function softDelete(id: number): Promise<void> {
  const existing = await repository.findById(id);

  if (existing.estado !== EstadoPermiso.PENDIENTE) {
    throw new ValidationError(
      "Solo se pueden eliminar permisos en estado pendiente",
    );
  }

  return repository.softDelete(id);
}

export async function approve(
  id: number,
  aprobadoPor: string,
  firmaDigital?: string,
): Promise<{ esquela: EsquelaResponse; pdfBase64: string }> {
  const existing = await repository.findById(id);

  validateStateTransition(
    existing.estado as EstadoPermiso,
    EstadoPermiso.APROBADA,
  );

  const esquela = await repository.approve(id, aprobadoPor, firmaDigital);
  const pdfBase64 = generatePermitPdf(esquela);

  return { esquela, pdfBase64 };
}

export async function reject(
  id: number,
  aprobadoPor: string,
): Promise<EsquelaResponse> {
  const existing = await repository.findById(id);

  validateStateTransition(
    existing.estado as EstadoPermiso,
    EstadoPermiso.RECHAZADA,
  );

  return repository.reject(id, aprobadoPor);
}

export async function findByWorker(
  trabajadorId: number,
): Promise<EsquelaResponse[]> {
  return repository.findByWorker(trabajadorId);
}

function generatePermitPdf(esquela: EsquelaResponse): string {
  const doc = new jsPDF("p", "mm", "letter");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ESQUELA DE PERMISO", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`No. ${String(esquela.id).slice(0, 8).toUpperCase()}`, pageWidth / 2, 33, {
    align: "center",
  });

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 38, pageWidth - margin, 38);

  const startY = 48;
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DATOS DEL TRABAJADOR", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const trabajador = esquela.trabajador;
  const workerName = trabajador
    ? `${trabajador.nombre} ${trabajador.apellidos}`
    : "N/A";
  const workerCedula = trabajador?.cedulaIdentidad ?? "N/A";
  const workerEmail = trabajador?.email ?? "N/A";
  const workerTelefono = trabajador?.telefono ?? "N/A";

  doc.text(`Nombre: ${workerName}`, margin, y);
  doc.text(`Cédula: ${workerCedula}`, margin + contentWidth / 2, y);
  y += 7;
  doc.text(`Email: ${workerEmail}`, margin, y);
  doc.text(`Teléfono: ${workerTelefono}`, margin + contentWidth / 2, y);
  y += 7;
  doc.text(`Cargo: ${esquela.cargo ?? trabajador?.cargo ?? "N/A"}`, margin, y);
  doc.text(`Ubicación: ${esquela.ubicacion}`, margin + contentWidth / 2, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DATOS DEL PERMISO", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const tipoPermiso = esquela.tipoPermiso?.nombre ?? "N/A";
  doc.text(`Tipo de Permiso: ${tipoPermiso}`, margin, y);
  doc.text(`Días: ${esquela.cantidadDias}`, margin + contentWidth / 2, y);
  y += 7;
  doc.text(
    `Periodo Correspondiente: ${esquela.periodoCorrespondiente}`,
    margin,
    y,
  );
  y += 7;
  doc.text(
    `Fecha de Incorporación: ${esquela.fechaIncorporacion}`,
    margin,
    y,
  );
  y += 7;

  const fechaElab = esquela.fechaElaborada
    ? new Date(esquela.fechaElaborada).toLocaleDateString("es-ES")
    : "N/A";
  doc.text(`Fecha de Elaboración: ${fechaElab}`, margin, y);
  y += 12;

  if (esquela.observaciones) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVACIONES", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(esquela.observaciones, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 7;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`ESTADO: ${esquela.estado.toUpperCase()}`, margin, y);
  y += 10;

  if (esquela.estado === EstadoPermiso.APROBADA) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Aprobado por: ${esquela.nombreAprobador ?? "N/A"}`,
      margin,
      y,
    );
    y += 7;

    if (esquela.firmaDigital) {
      doc.text("Firma Digital:", margin, y);
      y += 5;
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      const firmaLines = doc.splitTextToSize(
        esquela.firmaDigital,
        contentWidth,
      );
      doc.text(firmaLines, margin, y);
      y += firmaLines.length * 4 + 5;
    }

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + 80, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Firma del Autorizante", margin, y);
  }

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
}
