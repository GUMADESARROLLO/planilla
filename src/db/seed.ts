import "dotenv/config";
import { randomUUID as _randomUUID, randomBytes, scryptSync } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  tiposContrato,
  cargos,
  generos,
  nacionalidades,
  planillas,
  tallasCamisa,
  tallasPantalon,
  tiposPermisos,
  roles,
} from "./schemas";
import { trabajadores } from "./schemas/workers";
import { esquelasPermisos } from "./schemas/permits";
import { trabajadoresPlanillas } from "./schemas/workers_planillas";

const uuid = () => _randomUUID() as string;

function hashBetterAuth(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

async function seed() {
  console.log("🌱 Seeding database...");

  const existing = await db.select({ id: roles.id }).from(roles).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  // ───── Generate IDs ─────
  const ids = {
    contratoFijo: uuid(),
    contratoIndefinido: uuid(),
    contratoTemporal: uuid(),
    contratoProyecto: uuid(),
    contratoPracticas: uuid(),

    cargoGerente: uuid(),
    cargoContador: uuid(),
    cargoSecretario: uuid(),
    cargoDesarrollador: uuid(),
    cargoAnalista: uuid(),

    generoMasculino: uuid(),
    generoFemenino: uuid(),
    generoOtro: uuid(),

    nacionalidadNicaragua: uuid(),
    nacionalidadCostaRica: uuid(),
    nacionalidadHonduras: uuid(),
    nacionalidadGuatemala: uuid(),
    nacionalidadElSalvador: uuid(),

    planillaQuincenal: uuid(),
    planillaMensual: uuid(),
    planillaVehicular: uuid(),
    planillaAdministrativa: uuid(),
    planillaTemporal: uuid(),

    tallaCamisaXS: uuid(),
    tallaCamisaS: uuid(),
    tallaCamisaM: uuid(),
    tallaCamisaL: uuid(),
    tallaCamisaXL: uuid(),
    tallaCamisaXXL: uuid(),

    tallaPantalon28: uuid(),
    tallaPantalon30: uuid(),
    tallaPantalon32: uuid(),
    tallaPantalon34: uuid(),
    tallaPantalon36: uuid(),
    tallaPantalon38: uuid(),

    permisoEnfermedad: uuid(),
    permisoVacaciones: uuid(),
    permisoPersonal: uuid(),
    permisoMaternidad: uuid(),
    permisoLuto: uuid(),

    rolAdmin: uuid(),
    rolGerente: uuid(),
    rolSupervisor: uuid(),
    rolEmpleado: uuid(),

    usuarioAdmin: uuid(),

    trabajador1: uuid(),
    trabajador2: uuid(),
    trabajador3: uuid(),
    trabajador4: uuid(),
    trabajador5: uuid(),

    esquele1: uuid(),
    esquele2: uuid(),
  };

  // ───── 1. Insert catalog: tipos_contrato ─────
  const tiposContratoRows = [
    { id: ids.contratoFijo, nombre: "Fijo" },
    { id: ids.contratoIndefinido, nombre: "Indefinido" },
    { id: ids.contratoTemporal, nombre: "Temporal" },
    { id: ids.contratoProyecto, nombre: "Por proyecto" },
    { id: ids.contratoPracticas, nombre: "Prácticas" },
  ];
  for (const row of tiposContratoRows) {
    await db.insert(tiposContrato).values(row);
  }

  // ───── 2. Insert catalog: cargos ─────
  const cargosRows = [
    { id: ids.cargoGerente, nombre: "Gerente General" },
    { id: ids.cargoContador, nombre: "Contador" },
    { id: ids.cargoSecretario, nombre: "Secretario/a" },
    { id: ids.cargoDesarrollador, nombre: "Desarrollador" },
    { id: ids.cargoAnalista, nombre: "Analista" },
  ];
  for (const row of cargosRows) {
    await db.insert(cargos).values(row);
  }

  // ───── 3. Insert catalog: generos ─────
  const generosRows = [
    { id: ids.generoMasculino, nombre: "Masculino" },
    { id: ids.generoFemenino, nombre: "Femenino" },
    { id: ids.generoOtro, nombre: "Otro" },
  ];
  for (const row of generosRows) {
    await db.insert(generos).values(row);
  }

  // ───── 4. Insert catalog: nacionalidades ─────
  const nacionalidadesRows = [
    { id: ids.nacionalidadNicaragua, nombre: "Nicaragüense", codigoIso: "NI" },
    { id: ids.nacionalidadCostaRica, nombre: "Costarricense", codigoIso: "CR" },
    { id: ids.nacionalidadHonduras, nombre: "Hondureño", codigoIso: "HN" },
    { id: ids.nacionalidadGuatemala, nombre: "Guatemalteco", codigoIso: "GT" },
    { id: ids.nacionalidadElSalvador, nombre: "Salvadoreño", codigoIso: "SV" },
  ];
  for (const row of nacionalidadesRows) {
    await db.insert(nacionalidades).values(row);
  }

  // ───── 5. Insert catalog: planillas ─────
  const planillasRows = [
    { id: ids.planillaQuincenal, nombre: "Planilla Quincenal", tipo: "quincenal" as const, descripcion: "Pago quincenal de salarios" },
    { id: ids.planillaMensual, nombre: "Planilla Mensual", tipo: "mensual" as const, descripcion: "Pago mensual de salarios" },
    { id: ids.planillaVehicular, nombre: "Planilla Vehicular", tipo: "vehicular" as const, descripcion: "Pago de viáticos vehiculares" },
    { id: ids.planillaAdministrativa, nombre: "Planilla Administrativa", tipo: "administrativa" as const, descripcion: "Planilla del personal administrativo" },
    { id: ids.planillaTemporal, nombre: "Planilla Temporal", tipo: "temporal" as const, descripcion: "Pago de personal temporal" },
  ];
  for (const row of planillasRows) {
    await db.insert(planillas).values(row);
  }

  // ───── 6. Insert catalog: tallas_camisa ─────
  const tallasCamisaRows = [
    { id: ids.tallaCamisaXS, nombre: "XS" },
    { id: ids.tallaCamisaS, nombre: "S" },
    { id: ids.tallaCamisaM, nombre: "M" },
    { id: ids.tallaCamisaL, nombre: "L" },
    { id: ids.tallaCamisaXL, nombre: "XL" },
    { id: ids.tallaCamisaXXL, nombre: "XXL" },
  ];
  for (const row of tallasCamisaRows) {
    await db.insert(tallasCamisa).values(row);
  }

  // ───── 7. Insert catalog: tallas_pantalon ─────
  const tallasPantalonRows = [
    { id: ids.tallaPantalon28, nombre: "28" },
    { id: ids.tallaPantalon30, nombre: "30" },
    { id: ids.tallaPantalon32, nombre: "32" },
    { id: ids.tallaPantalon34, nombre: "34" },
    { id: ids.tallaPantalon36, nombre: "36" },
    { id: ids.tallaPantalon38, nombre: "38" },
  ];
  for (const row of tallasPantalonRows) {
    await db.insert(tallasPantalon).values(row);
  }

  // ───── 8. Insert catalog: tipos_permisos ─────
  const tiposPermisosRows = [
    { id: ids.permisoEnfermedad, nombre: "Enfermedad" },
    { id: ids.permisoVacaciones, nombre: "Vacaciones" },
    { id: ids.permisoPersonal, nombre: "Personal" },
    { id: ids.permisoMaternidad, nombre: "Maternidad" },
    { id: ids.permisoLuto, nombre: "Luto" },
  ];
  for (const row of tiposPermisosRows) {
    await db.insert(tiposPermisos).values(row);
  }

  // ───── 9. Insert catalog: roles ─────
  const rolesRows = [
    { id: ids.rolAdmin, nombre: "ADMIN" },
    { id: ids.rolGerente, nombre: "GERENTE" },
    { id: ids.rolSupervisor, nombre: "SUPERVISOR" },
    { id: ids.rolEmpleado, nombre: "EMPLEADO" },
  ];
  for (const row of rolesRows) {
    await db.insert(roles).values(row);
  }

  // ───── 10. Create admin user in Better Auth tables ─────
  const passwordHash = hashBetterAuth("Admin123!");
  const now = new Date();
  await db.execute(
    sql`INSERT INTO \`user\` (id, email, name, emailVerified, role, activo, nombre, apellidos, createdAt, updatedAt)
        VALUES (${ids.usuarioAdmin}, 'admin@planilla.com', 'Admin Sistema', false, 'ADMIN', true, 'Admin', 'Sistema', ${now}, ${now})`
  );
  await db.execute(
    sql`INSERT INTO \`account\` (id, accountId, providerId, userId, password, createdAt, updatedAt)
        VALUES (${crypto.randomUUID()}, ${crypto.randomUUID()}, 'credential', ${ids.usuarioAdmin}, ${passwordHash}, ${now}, ${now})`
  );

  // ───── 11. Create 5 sample workers ─────
  const workersRows = [
    {
      id: ids.trabajador1,
      nombre: "Carlos",
      apellidos: "Méndez López",
      fechaEntrada: new Date("2020-03-15"),
      email: "carlos.mendez@empresa.com",
      nacionalidadId: ids.nacionalidadNicaragua,
      numeroInss: "INSS-001-2020",
      cedulaIdentidad: "001-150300-0001A",
      telefono: "505-8888-0001",
      saldoVacaciones: "15.00",
      tallaCamisaId: ids.tallaCamisaL,
      tallaPantalonId: ids.tallaPantalon34,
      tipoContratoId: ids.contratoIndefinido,
      cargoId: ids.cargoGerente,
      generoId: ids.generoMasculino,
      activo: true,
      direccion: "Managua, Nicaragua",
    },
    {
      id: ids.trabajador2,
      nombre: "María",
      apellidos: "García Ruiz",
      fechaEntrada: new Date("2021-06-01"),
      email: "maria.garcia@empresa.com",
      nacionalidadId: ids.nacionalidadNicaragua,
      numeroInss: "INSS-002-2021",
      cedulaIdentidad: "001-010600-0002B",
      telefono: "505-8888-0002",
      saldoVacaciones: "10.00",
      tallaCamisaId: ids.tallaCamisaM,
      tallaPantalonId: ids.tallaPantalon30,
      tipoContratoId: ids.contratoFijo,
      cargoId: ids.cargoContador,
      generoId: ids.generoFemenino,
      activo: true,
      direccion: "León, Nicaragua",
    },
    {
      id: ids.trabajador3,
      nombre: "Pedro",
      apellidos: "Ramírez Castillo",
      fechaEntrada: new Date("2022-01-10"),
      email: "pedro.ramirez@empresa.com",
      nacionalidadId: ids.nacionalidadCostaRica,
      numeroInss: "INSS-003-2022",
      cedulaIdentidad: "001-100122-0003C",
      telefono: "505-8888-0003",
      saldoVacaciones: "8.00",
      tallaCamisaId: ids.tallaCamisaXL,
      tallaPantalonId: ids.tallaPantalon36,
      tipoContratoId: ids.contratoTemporal,
      cargoId: ids.cargoDesarrollador,
      generoId: ids.generoMasculino,
      activo: true,
      direccion: "Granada, Nicaragua",
    },
    {
      id: ids.trabajador4,
      nombre: "Ana",
      apellidos: "Martínez Flores",
      fechaEntrada: new Date("2023-04-22"),
      email: "ana.martinez@empresa.com",
      nacionalidadId: ids.nacionalidadNicaragua,
      numeroInss: "INSS-004-2023",
      cedulaIdentidad: "001-220423-0004D",
      telefono: "505-8888-0004",
      saldoVacaciones: "5.00",
      tallaCamisaId: ids.tallaCamisaS,
      tallaPantalonId: ids.tallaPantalon28,
      tipoContratoId: ids.contratoFijo,
      cargoId: ids.cargoSecretario,
      generoId: ids.generoFemenino,
      activo: true,
      direccion: "Masaya, Nicaragua",
    },
    {
      id: ids.trabajador5,
      nombre: "Luis",
      apellidos: "Hernández Vega",
      fechaEntrada: new Date("2024-09-05"),
      email: "luis.hernandez@empresa.com",
      nacionalidadId: ids.nacionalidadHonduras,
      numeroInss: "INSS-005-2024",
      cedulaIdentidad: "001-050924-0005E",
      telefono: "505-8888-0005",
      saldoVacaciones: "2.00",
      tallaCamisaId: ids.tallaCamisaM,
      tallaPantalonId: ids.tallaPantalon32,
      tipoContratoId: ids.contratoProyecto,
      cargoId: ids.cargoAnalista,
      generoId: ids.generoMasculino,
      activo: true,
      direccion: "Estelí, Nicaragua",
    },
  ];
  for (const row of workersRows) {
    await db.insert(trabajadores).values(row);
  }

  // ───── 12. Create 2 sample esquelas ─────
  const esquelasRows = [
    {
      id: ids.esquele1,
      trabajadorId: ids.trabajador1,
      cargo: "Gerente General",
      ubicacion: "Oficina Central - Managua",
      tipoPermisoId: ids.permisoVacaciones,
      cantidadDias: 5,
      periodoCorrespondiente: "Enero 2026",
      fechaIncorporacion: new Date("2026-01-20"),
      observaciones: "Vacaciones anuales programadas",
      estado: "aprobada" as const,
      aprobadoPor: ids.usuarioAdmin,
    },
    {
      id: ids.esquele2,
      trabajadorId: ids.trabajador3,
      ubicacion: "Departamento de TI",
      tipoPermisoId: ids.permisoPersonal,
      cantidadDias: 1,
      periodoCorrespondiente: "Febrero 2026",
      fechaIncorporacion: new Date("2026-02-14"),
      estado: "pendiente" as const,
    },
  ];
  for (const row of esquelasRows) {
    await db.insert(esquelasPermisos).values(row);
  }

  // ───── 13. Link workers to planillas ─────
  const planillasLinks = [
    { trabajadorId: ids.trabajador1, planillaId: ids.planillaQuincenal },
    { trabajadorId: ids.trabajador1, planillaId: ids.planillaAdministrativa },
    { trabajadorId: ids.trabajador2, planillaId: ids.planillaQuincenal },
    { trabajadorId: ids.trabajador3, planillaId: ids.planillaQuincenal },
    { trabajadorId: ids.trabajador4, planillaId: ids.planillaMensual },
    { trabajadorId: ids.trabajador5, planillaId: ids.planillaTemporal },
  ];
  for (const row of planillasLinks) {
    await db.insert(trabajadoresPlanillas).values(row);
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
