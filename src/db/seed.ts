import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
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
  unidadesNegocio,
  departamentos,
  horarios,
  deptosNi,
  municipios,
} from "./schemas";
import { trabajadores } from "./schemas/workers";
import { esquelasPermisos } from "./schemas/permits";
import { trabajadoresPlanillas } from "./schemas/workers_planillas";

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
  console.log("Seeding database...");

  const existing = await db.select({ id: roles.id }).from(roles).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  const adminUserId = "usr-1";
  const UNIDAD = 1;

  const ids = {
    contratoFijo: 1, contratoIndefinido: 2, contratoTemporal: 3,
    contratoProyecto: 4, contratoPracticas: 5,
    cargoGerente: 1, cargoContador: 2, cargoSecretario: 3,
    cargoDesarrollador: 4, cargoAnalista: 5,
    generoMasculino: 1, generoFemenino: 2, generoOtro: 3,
    nacionalidadNicaragua: 1, nacionalidadCostaRica: 2,
    nacionalidadHonduras: 3, nacionalidadGuatemala: 4,
    nacionalidadElSalvador: 5,
    planillaQuincenal: 1, planillaMensual: 2, planillaVehicular: 3,
    planillaAdministrativa: 4, planillaTemporal: 5,
    tallaCamisaXS: 1, tallaCamisaS: 2, tallaCamisaM: 3,
    tallaCamisaL: 4, tallaCamisaXL: 5, tallaCamisaXXL: 6,
    tallaPantalon28: 1, tallaPantalon30: 2, tallaPantalon32: 3,
    tallaPantalon34: 4, tallaPantalon36: 5, tallaPantalon38: 6,
    permisoEnfermedad: 1, permisoVacaciones: 2, permisoPersonal: 3,
    permisoMaternidad: 4, permisoLuto: 5,
    rolAdmin: 1, rolGerente: 2, rolSupervisor: 3, rolEmpleado: 4,
    deptoGestionHumana: 1, deptoInformatica: 2, deptoCartera: 3,
    deptoSAC: 4, deptoContabilidad: 5, deptoArtes: 6,
    deptoRegencia: 7, deptoTraductores: 8,
  };

  // ───── tipos_contrato ─────
  for (const row of [
    { id: ids.contratoFijo, nombre: "Fijo" },
    { id: ids.contratoIndefinido, nombre: "Indefinido" },
    { id: ids.contratoTemporal, nombre: "Temporal" },
    { id: ids.contratoProyecto, nombre: "Por proyecto" },
    { id: ids.contratoPracticas, nombre: "Prácticas" },
  ]) await db.insert(tiposContrato).values(row);

  // ───── generos ─────
  for (const row of [
    { id: ids.generoMasculino, nombre: "Masculino" },
    { id: ids.generoFemenino, nombre: "Femenino" },
    { id: ids.generoOtro, nombre: "Otro" },
  ]) await db.insert(generos).values(row);

  // ───── nacionalidades ─────
  for (const row of [
    { id: ids.nacionalidadNicaragua, nombre: "Nicaragüense", codigoIso: "NI" },
    { id: ids.nacionalidadCostaRica, nombre: "Costarricense", codigoIso: "CR" },
    { id: ids.nacionalidadHonduras, nombre: "Hondureño", codigoIso: "HN" },
    { id: ids.nacionalidadGuatemala, nombre: "Guatemalteco", codigoIso: "GT" },
    { id: ids.nacionalidadElSalvador, nombre: "Salvadoreño", codigoIso: "SV" },
  ]) await db.insert(nacionalidades).values(row);

  // ───── planillas ─────
  for (const row of [
    { id: ids.planillaQuincenal, nombre: "Planilla Quincenal", tipo: "quincenal" as const, descripcion: "Pago quincenal de salarios" },
    { id: ids.planillaMensual, nombre: "Planilla Mensual", tipo: "mensual" as const, descripcion: "Pago mensual de salarios" },
    { id: ids.planillaVehicular, nombre: "Planilla Vehicular", tipo: "vehicular" as const, descripcion: "Pago de viáticos vehiculares" },
    { id: ids.planillaAdministrativa, nombre: "Planilla Administrativa", tipo: "administrativa" as const, descripcion: "Planilla del personal administrativo" },
    { id: ids.planillaTemporal, nombre: "Planilla Temporal", tipo: "temporal" as const, descripcion: "Pago de personal temporal" },
  ]) await db.insert(planillas).values(row);

  // ───── tallas_camisa ─────
  for (const row of [
    { id: ids.tallaCamisaXS, nombre: "XS" }, { id: ids.tallaCamisaS, nombre: "S" },
    { id: ids.tallaCamisaM, nombre: "M" }, { id: ids.tallaCamisaL, nombre: "L" },
    { id: ids.tallaCamisaXL, nombre: "XL" }, { id: ids.tallaCamisaXXL, nombre: "XXL" },
  ]) await db.insert(tallasCamisa).values(row);

  // ───── tallas_pantalon ─────
  for (const row of [
    { id: ids.tallaPantalon28, nombre: "28" }, { id: ids.tallaPantalon30, nombre: "30" },
    { id: ids.tallaPantalon32, nombre: "32" }, { id: ids.tallaPantalon34, nombre: "34" },
    { id: ids.tallaPantalon36, nombre: "36" }, { id: ids.tallaPantalon38, nombre: "38" },
  ]) await db.insert(tallasPantalon).values(row);

  // ───── tipos_permisos ─────
  for (const row of [
    { id: ids.permisoEnfermedad, nombre: "Enfermedad" },
    { id: ids.permisoVacaciones, nombre: "Vacaciones" },
    { id: ids.permisoPersonal, nombre: "Personal" },
    { id: ids.permisoMaternidad, nombre: "Maternidad" },
    { id: ids.permisoLuto, nombre: "Luto" },
  ]) await db.insert(tiposPermisos).values(row);

  // ───── roles ─────
  for (const row of [
    { id: ids.rolAdmin, nombre: "ADMIN" },
    { id: ids.rolGerente, nombre: "GERENTE" },
    { id: ids.rolSupervisor, nombre: "SUPERVISOR" },
    { id: ids.rolEmpleado, nombre: "EMPLEADO" },
  ]) await db.insert(roles).values(row);

  // ───── unidades_negocio (only UNIMARK SA) ─────
  await db.insert(unidadesNegocio).values({
    id: UNIDAD, nombre: "UNIMARK SA", descripcion: "Unidad principal de comercialización",
  });

  // ───── departamentos ─────
  const deptos = [
    { id: ids.deptoGestionHumana, nombre: "GESTIÓN HUMANA" },
    { id: ids.deptoInformatica, nombre: "INFORMÁTICA" },
    { id: ids.deptoCartera, nombre: "CARTERA & COBRO" },
    { id: ids.deptoSAC, nombre: "SAC" },
    { id: ids.deptoContabilidad, nombre: "CONTABILIDAD" },
    { id: ids.deptoArtes, nombre: "ARTES" },
    { id: ids.deptoRegencia, nombre: "REGENCIA" },
    { id: ids.deptoTraductores, nombre: "TRADUCTORES" },
  ];
  for (const d of deptos) {
    await db.insert(departamentos).values({ ...d, unidadNegocioId: UNIDAD });
  }

  // ───── cargos (same 5, updated departamentoId mappings) ─────
  for (const row of [
    { id: ids.cargoGerente, nombre: "Gerente General", departamentoId: ids.deptoGestionHumana },
    { id: ids.cargoContador, nombre: "Contador", departamentoId: ids.deptoContabilidad },
    { id: ids.cargoSecretario, nombre: "Secretario/a", departamentoId: ids.deptoGestionHumana },
    { id: ids.cargoDesarrollador, nombre: "Desarrollador", departamentoId: ids.deptoInformatica },
    { id: ids.cargoAnalista, nombre: "Analista", departamentoId: ids.deptoInformatica },
  ]) await db.insert(cargos).values({ ...row, unidadNegocioId: UNIDAD });

  // ───── horarios ─────
  await db.insert(horarios).values({
    id: 1, nombre: "General 7:30 AM – 5:30 PM", descripcion: "Horario estándar de oficina", horaInicio: "07:30", horaFin: "17:30",
  });

  // ───── deptos_ni (17 departments) ─────
  const deptosData = [
    { zona: "Pacífico", nombre: "Boaco", cabecera: "Boaco", iso: "NI-BO" },
    { zona: "Pacífico", nombre: "Carazo", cabecera: "Jinotepe", iso: "NI-CA" },
    { zona: "Pacífico", nombre: "Chinandega", cabecera: "Chinandega", iso: "NI-CI" },
    { zona: "Pacífico", nombre: "Granada", cabecera: "Granada", iso: "NI-GR" },
    { zona: "Pacífico", nombre: "León", cabecera: "León", iso: "NI-LE" },
    { zona: "Pacífico", nombre: "Managua", cabecera: "Managua", iso: "NI-MN" },
    { zona: "Pacífico", nombre: "Masaya", cabecera: "Masaya", iso: "NI-MS" },
    { zona: "Pacífico", nombre: "Rivas", cabecera: "Rivas", iso: "NI-RI" },
    { zona: "Central y Norte", nombre: "Chontales", cabecera: "Juigalpa", iso: "NI-CO" },
    { zona: "Central y Norte", nombre: "Estelí", cabecera: "Estelí", iso: "NI-ES" },
    { zona: "Central y Norte", nombre: "Jinotega", cabecera: "Jinotega", iso: "NI-JI" },
    { zona: "Central y Norte", nombre: "Madriz", cabecera: "Somoto", iso: "NI-MD" },
    { zona: "Central y Norte", nombre: "Matagalpa", cabecera: "Matagalpa", iso: "NI-MT" },
    { zona: "Central y Norte", nombre: "Nueva Segovia", cabecera: "Ocotal", iso: "NI-NS" },
    { zona: "Central y Norte", nombre: "Río San Juan", cabecera: "San Carlos", iso: "NI-SJ" },
    { zona: "Costa Caribe", nombre: "Costa Caribe Norte", cabecera: "Puerto Cabezas", iso: "NI-AN" },
    { zona: "Costa Caribe", nombre: "Costa Caribe Sur", cabecera: "Bluefields", iso: "NI-AS" },
  ];
  for (let i = 0; i < deptosData.length; i++) {
    await db.insert(deptosNi).values({ id: i + 1, ...deptosData[i] } as any);
  }

  // ───── municipios (153) ─────
  const municipiosData: { nombre: string; deptoNiId: number }[] = [
    // Boaco (id=1)
    { nombre: "Boaco", deptoNiId: 1 }, { nombre: "Camoapa", deptoNiId: 1 }, { nombre: "San José de los Remates", deptoNiId: 1 }, { nombre: "San Lorenzo", deptoNiId: 1 }, { nombre: "Santa Lucía", deptoNiId: 1 }, { nombre: "Teustepe", deptoNiId: 1 },
    // Carazo (id=2)
    { nombre: "Diriamba", deptoNiId: 2 }, { nombre: "Dolores", deptoNiId: 2 }, { nombre: "El Rosario", deptoNiId: 2 }, { nombre: "Jinotepe", deptoNiId: 2 }, { nombre: "La Conquista", deptoNiId: 2 }, { nombre: "La Paz de Carazo", deptoNiId: 2 }, { nombre: "San Marcos", deptoNiId: 2 }, { nombre: "Santa Teresa", deptoNiId: 2 },
    // Chinandega (id=3)
    { nombre: "Chichigalpa", deptoNiId: 3 }, { nombre: "Chinandega", deptoNiId: 3 }, { nombre: "Cinco Pinos", deptoNiId: 3 }, { nombre: "Corinto", deptoNiId: 3 }, { nombre: "El Realejo", deptoNiId: 3 }, { nombre: "El Viejo", deptoNiId: 3 }, { nombre: "Posoltega", deptoNiId: 3 }, { nombre: "Puerto Morazán", deptoNiId: 3 }, { nombre: "San Francisco del Norte", deptoNiId: 3 }, { nombre: "San Pedro del Norte", deptoNiId: 3 }, { nombre: "Santo Tomás del Norte", deptoNiId: 3 }, { nombre: "Somotillo", deptoNiId: 3 }, { nombre: "Villanueva", deptoNiId: 3 },
    // Granada (id=4)
    { nombre: "Diriá", deptoNiId: 4 }, { nombre: "Diriomo", deptoNiId: 4 }, { nombre: "Granada", deptoNiId: 4 }, { nombre: "Nandaime", deptoNiId: 4 },
    // León (id=5)
    { nombre: "Achuapa", deptoNiId: 5 }, { nombre: "El Jicaral", deptoNiId: 5 }, { nombre: "El Sauce", deptoNiId: 5 }, { nombre: "La Paz Centro", deptoNiId: 5 }, { nombre: "León", deptoNiId: 5 }, { nombre: "Nagarote", deptoNiId: 5 }, { nombre: "Quezalguaque", deptoNiId: 5 }, { nombre: "Santa Rosa del Peñón", deptoNiId: 5 }, { nombre: "Telica", deptoNiId: 5 }, { nombre: "Larreynaga", deptoNiId: 5 },
    // Managua (id=6)
    { nombre: "Ciudad Sandino", deptoNiId: 6 }, { nombre: "El Crucero", deptoNiId: 6 }, { nombre: "Managua", deptoNiId: 6 }, { nombre: "Mateare", deptoNiId: 6 }, { nombre: "San Francisco Libre", deptoNiId: 6 }, { nombre: "San Rafael del Sur", deptoNiId: 6 }, { nombre: "Ticuantepe", deptoNiId: 6 }, { nombre: "Tipitapa", deptoNiId: 6 }, { nombre: "Villa El Carmen", deptoNiId: 6 },
    // Masaya (id=7)
    { nombre: "Catarina", deptoNiId: 7 }, { nombre: "La Concepción", deptoNiId: 7 }, { nombre: "Masatepe", deptoNiId: 7 }, { nombre: "Masaya", deptoNiId: 7 }, { nombre: "Nandasmo", deptoNiId: 7 }, { nombre: "Nindirí", deptoNiId: 7 }, { nombre: "Niquinohomo", deptoNiId: 7 }, { nombre: "San Juan de Oriente", deptoNiId: 7 }, { nombre: "Tisma", deptoNiId: 7 },
    // Rivas (id=8)
    { nombre: "Altagracia", deptoNiId: 8 }, { nombre: "Belén", deptoNiId: 8 }, { nombre: "Buenos Aires", deptoNiId: 8 }, { nombre: "Cárdenas", deptoNiId: 8 }, { nombre: "Moyogalpa", deptoNiId: 8 }, { nombre: "Potosí", deptoNiId: 8 }, { nombre: "Rivas", deptoNiId: 8 }, { nombre: "San Jorge", deptoNiId: 8 }, { nombre: "San Juan del Sur", deptoNiId: 8 }, { nombre: "Tola", deptoNiId: 8 },
    // Chontales (id=9)
    { nombre: "Acoyapa", deptoNiId: 9 }, { nombre: "Comalapa", deptoNiId: 9 }, { nombre: "El Coral", deptoNiId: 9 }, { nombre: "Juigalpa", deptoNiId: 9 }, { nombre: "La Libertad", deptoNiId: 9 }, { nombre: "San Francisco de Cuapa", deptoNiId: 9 }, { nombre: "San Pedro de Lóvago", deptoNiId: 9 }, { nombre: "Santo Domingo", deptoNiId: 9 }, { nombre: "Santo Tomás", deptoNiId: 9 }, { nombre: "Villa Sandino", deptoNiId: 9 },
    // Estelí (id=10)
    { nombre: "Condega", deptoNiId: 10 }, { nombre: "Estelí", deptoNiId: 10 }, { nombre: "La Trinidad", deptoNiId: 10 }, { nombre: "Pueblo Nuevo", deptoNiId: 10 }, { nombre: "San Juan de Limay", deptoNiId: 10 }, { nombre: "San Nicolás", deptoNiId: 10 },
    // Jinotega (id=11)
    { nombre: "El Cuá", deptoNiId: 11 }, { nombre: "Jinotega", deptoNiId: 11 }, { nombre: "La Concordia", deptoNiId: 11 }, { nombre: "San José de Bocay", deptoNiId: 11 }, { nombre: "San Rafael del Norte", deptoNiId: 11 }, { nombre: "San Sebastián de Yalí", deptoNiId: 11 }, { nombre: "Santa María de Pantasma", deptoNiId: 11 }, { nombre: "Wiwilí de Jinotega", deptoNiId: 11 },
    // Madriz (id=12)
    { nombre: "Las Sabanas", deptoNiId: 12 }, { nombre: "Palacagüina", deptoNiId: 12 }, { nombre: "San José de Cusmapa", deptoNiId: 12 }, { nombre: "San Juan del Río Coco", deptoNiId: 12 }, { nombre: "San Lucas", deptoNiId: 12 }, { nombre: "Somoto", deptoNiId: 12 }, { nombre: "Telpaneca", deptoNiId: 12 }, { nombre: "Totogalpa", deptoNiId: 12 }, { nombre: "Yalagüina", deptoNiId: 12 },
    // Matagalpa (id=13)
    { nombre: "Ciudad Darío", deptoNiId: 13 }, { nombre: "El Tuma - La Dalia", deptoNiId: 13 }, { nombre: "Esquipulas", deptoNiId: 13 }, { nombre: "Matagalpa", deptoNiId: 13 }, { nombre: "Matiguás", deptoNiId: 13 }, { nombre: "Muy Muy", deptoNiId: 13 }, { nombre: "Rancho Grande", deptoNiId: 13 }, { nombre: "Río Blanco", deptoNiId: 13 }, { nombre: "San Dionisio", deptoNiId: 13 }, { nombre: "San Isidro", deptoNiId: 13 }, { nombre: "San Ramón", deptoNiId: 13 }, { nombre: "Sébaco", deptoNiId: 13 }, { nombre: "Terrabona", deptoNiId: 13 },
    // Nueva Segovia (id=14)
    { nombre: "Ciudad Antigua", deptoNiId: 14 }, { nombre: "Dipilto", deptoNiId: 14 }, { nombre: "El Jícaro", deptoNiId: 14 }, { nombre: "Jalapa", deptoNiId: 14 }, { nombre: "Macuelizo", deptoNiId: 14 }, { nombre: "Mozonte", deptoNiId: 14 }, { nombre: "Murra", deptoNiId: 14 }, { nombre: "Ocotal", deptoNiId: 14 }, { nombre: "Quilalí", deptoNiId: 14 }, { nombre: "San Fernando", deptoNiId: 14 }, { nombre: "Santa María", deptoNiId: 14 }, { nombre: "Wiwilí de Nueva Segovia", deptoNiId: 14 },
    // Río San Juan (id=15)
    { nombre: "El Almendro", deptoNiId: 15 }, { nombre: "El Castillo", deptoNiId: 15 }, { nombre: "Morrito", deptoNiId: 15 }, { nombre: "San Carlos", deptoNiId: 15 }, { nombre: "San Juan de Nicaragua", deptoNiId: 15 }, { nombre: "San Miguelito", deptoNiId: 15 },
    // Costa Caribe Norte (id=16)
    { nombre: "Bonanza", deptoNiId: 16 }, { nombre: "Mulukukú", deptoNiId: 16 }, { nombre: "Prinzapolka", deptoNiId: 16 }, { nombre: "Puerto Cabezas", deptoNiId: 16 }, { nombre: "Rosita", deptoNiId: 16 }, { nombre: "Siuna", deptoNiId: 16 }, { nombre: "Waslala", deptoNiId: 16 }, { nombre: "Waspán", deptoNiId: 16 },
    // Costa Caribe Sur (id=17)
    { nombre: "Bluefields", deptoNiId: 17 }, { nombre: "Corn Island", deptoNiId: 17 }, { nombre: "Desembocadura de Río Grande", deptoNiId: 17 }, { nombre: "El Ayote", deptoNiId: 17 }, { nombre: "El Rama", deptoNiId: 17 }, { nombre: "El Tortuguero", deptoNiId: 17 }, { nombre: "Kukra Hill", deptoNiId: 17 }, { nombre: "La Cruz de Río Grande", deptoNiId: 17 }, { nombre: "Laguna de Perlas", deptoNiId: 17 }, { nombre: "Muelle de los Bueyes", deptoNiId: 17 }, { nombre: "Nueva Guinea", deptoNiId: 17 }, { nombre: "Paiwas", deptoNiId: 17 },
  ];
  for (let i = 0; i < municipiosData.length; i++) {
    await db.insert(municipios).values({ id: i + 1, ...municipiosData[i] } as any);
  }

  // ───── admin user ─────
  const passwordHash = hashBetterAuth("Admin123!");
  const now = new Date();
  await db.execute(
    sql`INSERT INTO \`user\` (id, email, name, emailVerified, role, activo, nombre, apellidos, createdAt, updatedAt)
        VALUES (${adminUserId}, 'admin@planilla.com', 'Admin Sistema', false, 'ADMIN', true, 'Admin', 'Sistema', ${now}, ${now})`
  );
  await db.execute(
    sql`INSERT INTO \`account\` (id, accountId, providerId, userId, password, createdAt, updatedAt)
        VALUES ('acc-1', 'acc-1', 'credential', ${adminUserId}, ${passwordHash}, ${now}, ${now})`
  );

  // ───── 35 workers ─────
  const tallasC = [ids.tallaCamisaS, ids.tallaCamisaM, ids.tallaCamisaL, ids.tallaCamisaXL];
  const tallasP = [ids.tallaPantalon28, ids.tallaPantalon30, ids.tallaPantalon32, ids.tallaPantalon34];
  const contratos = [ids.contratoFijo, ids.contratoIndefinido, ids.contratoTemporal, ids.contratoProyecto];
  const generosArr = [ids.generoMasculino, ids.generoFemenino];
  const nacs = [ids.nacionalidadNicaragua, ids.nacionalidadCostaRica, ids.nacionalidadHonduras];

  function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]!; }

  interface WorkerDef {
    nombre: string; apellidos: string; email: string; cedula: string;
    inss: string; tel: string; departamentoId: number;
  }

  const workerDefs: WorkerDef[] = [
    // GESTIÓN HUMANA (3)
    { nombre: "Juan", apellidos: "Pérez García", email: "juan.perez@gestion.com", cedula: "001-150390-1001A", inss: "INSS-101-2020", tel: "505-8100-1001", departamentoId: ids.deptoGestionHumana },
    { nombre: "María", apellidos: "López Martínez", email: "maria.lopez@gestion.com", cedula: "001-220491-1002B", inss: "INSS-102-2021", tel: "505-8100-1002", departamentoId: ids.deptoGestionHumana },
    { nombre: "Carlos", apellidos: "Ruiz Mendoza", email: "carlos.ruiz@gestion.com", cedula: "001-100392-1003C", inss: "INSS-103-2022", tel: "505-8100-1003", departamentoId: ids.deptoGestionHumana },
    // INFORMÁTICA (3)
    { nombre: "Pedro", apellidos: "Ramírez Ortiz", email: "pedro.ramirez@inf.com", cedula: "001-050693-2001A", inss: "INSS-201-2019", tel: "505-8200-2001", departamentoId: ids.deptoInformatica },
    { nombre: "Ana", apellidos: "Martínez Rivas", email: "ana.martinez@inf.com", cedula: "001-180794-2002B", inss: "INSS-202-2020", tel: "505-8200-2002", departamentoId: ids.deptoInformatica },
    { nombre: "Luis", apellidos: "Hernández Solís", email: "luis.hernandez@inf.com", cedula: "001-250895-2003C", inss: "INSS-203-2021", tel: "505-8200-2003", departamentoId: ids.deptoInformatica },
    // CARTERA & COBRO (4)
    { nombre: "Sofía", apellidos: "Gutiérrez Vega", email: "sofia.gutierrez@cartera.com", cedula: "001-120196-3001A", inss: "INSS-301-2020", tel: "505-8300-3001", departamentoId: ids.deptoCartera },
    { nombre: "Miguel", apellidos: "Torres Campos", email: "miguel.torres@cartera.com", cedula: "001-080297-3002B", inss: "INSS-302-2021", tel: "505-8300-3002", departamentoId: ids.deptoCartera },
    { nombre: "Carmen", apellidos: "Rojas Prado", email: "carmen.rojas@cartera.com", cedula: "001-220398-3003C", inss: "INSS-303-2022", tel: "505-8300-3003", departamentoId: ids.deptoCartera },
    { nombre: "José", apellidos: "Molina Castro", email: "jose.molina@cartera.com", cedula: "001-150499-3004D", inss: "INSS-304-2023", tel: "505-8300-3004", departamentoId: ids.deptoCartera },
    // SAC (6)
    { nombre: "Laura", apellidos: "Díaz Herrera", email: "laura.diaz@sac.com", cedula: "001-100500-4001A", inss: "INSS-401-2019", tel: "505-8400-4001", departamentoId: ids.deptoSAC },
    { nombre: "Andrés", apellidos: "Vargas Ríos", email: "andres.vargas@sac.com", cedula: "001-200601-4002B", inss: "INSS-402-2020", tel: "505-8400-4002", departamentoId: ids.deptoSAC },
    { nombre: "Gabriela", apellidos: "Cruz Meza", email: "gabriela.cruz@sac.com", cedula: "001-050702-4003C", inss: "INSS-403-2021", tel: "505-8400-4003", departamentoId: ids.deptoSAC },
    { nombre: "Fernando", apellidos: "Soto Aguilar", email: "fernando.soto@sac.com", cedula: "001-180803-4004D", inss: "INSS-404-2022", tel: "505-8400-4004", departamentoId: ids.deptoSAC },
    { nombre: "Isabel", apellidos: "Morales Fuentes", email: "isabel.morales@sac.com", cedula: "001-250904-4005E", inss: "INSS-405-2023", tel: "505-8400-4005", departamentoId: ids.deptoSAC },
    { nombre: "Ricardo", apellidos: "Flores Blanco", email: "ricardo.flores@sac.com", cedula: "001-121005-4006F", inss: "INSS-406-2024", tel: "505-8400-4006", departamentoId: ids.deptoSAC },
    // CONTABILIDAD (7)
    { nombre: "Marta", apellidos: "Salinas Duarte", email: "marta.salinas@contabilidad.com", cedula: "001-011106-5001A", inss: "INSS-501-2020", tel: "505-8500-5001", departamentoId: ids.deptoContabilidad },
    { nombre: "Héctor", apellidos: "Paredes Luna", email: "hector.paredes@contabilidad.com", cedula: "001-150207-5002B", inss: "INSS-502-2021", tel: "505-8500-5002", departamentoId: ids.deptoContabilidad },
    { nombre: "Verónica", apellidos: "Castro Núñez", email: "veronica.castro@contabilidad.com", cedula: "001-080308-5003C", inss: "INSS-503-2022", tel: "505-8500-5003", departamentoId: ids.deptoContabilidad },
    { nombre: "Roberto", apellidos: "Delgado Mora", email: "roberto.delgado@contabilidad.com", cedula: "001-220409-5004D", inss: "INSS-504-2023", tel: "505-8500-5004", departamentoId: ids.deptoContabilidad },
    { nombre: "Patricia", apellidos: "Araya Sandoval", email: "patricia.araya@contabilidad.com", cedula: "001-100510-5005E", inss: "INSS-505-2024", tel: "505-8500-5005", departamentoId: ids.deptoContabilidad },
    { nombre: "Alberto", apellidos: "Villalobos Rivas", email: "alberto.villalobos@contabilidad.com", cedula: "001-050611-5006F", inss: "INSS-506-2025", tel: "505-8500-5006", departamentoId: ids.deptoContabilidad },
    { nombre: "Diana", apellidos: "Méndez Pizarro", email: "diana.mendez@contabilidad.com", cedula: "001-180712-5007G", inss: "INSS-507-2025", tel: "505-8500-5007", departamentoId: ids.deptoContabilidad },
    // ARTES (3)
    { nombre: "Pablo", apellidos: "Escobar Vega", email: "pablo.escobar@artes.com", cedula: "001-120813-6001A", inss: "INSS-601-2021", tel: "505-8600-6001", departamentoId: ids.deptoArtes },
    { nombre: "Rosa", apellidos: "Medina Cordero", email: "rosa.medina@artes.com", cedula: "001-250914-6002B", inss: "INSS-602-2022", tel: "505-8600-6002", departamentoId: ids.deptoArtes },
    { nombre: "Diego", apellidos: "Chacón Rojas", email: "diego.chacon@artes.com", cedula: "001-081015-6003C", inss: "INSS-603-2023", tel: "505-8600-6003", departamentoId: ids.deptoArtes },
    // REGENCIA (6)
    { nombre: "Elena", apellidos: "Bermúdez Solano", email: "elena.bermudez@regencia.com", cedula: "001-011116-7001A", inss: "INSS-701-2020", tel: "505-8700-7001", departamentoId: ids.deptoRegencia },
    { nombre: "Jorge", apellidos: "Cordero Mendoza", email: "jorge.cordero@regencia.com", cedula: "001-150217-7002B", inss: "INSS-702-2021", tel: "505-8700-7002", departamentoId: ids.deptoRegencia },
    { nombre: "Silvia", apellidos: "Navarro Soto", email: "silvia.navarro@regencia.com", cedula: "001-080318-7003C", inss: "INSS-703-2022", tel: "505-8700-7003", departamentoId: ids.deptoRegencia },
    { nombre: "Oscar", apellidos: "Pereira Campos", email: "oscar.pereira@regencia.com", cedula: "001-220419-7004D", inss: "INSS-704-2023", tel: "505-8700-7004", departamentoId: ids.deptoRegencia },
    { nombre: "Natalia", apellidos: "Vega Guerrero", email: "natalia.vega@regencia.com", cedula: "001-100520-7005E", inss: "INSS-705-2024", tel: "505-8700-7005", departamentoId: ids.deptoRegencia },
    { nombre: "Gustavo", apellidos: "Rivas Peña", email: "gustavo.rivas@regencia.com", cedula: "001-050621-7006F", inss: "INSS-706-2025", tel: "505-8700-7006", departamentoId: ids.deptoRegencia },
    // TRADUCTORES (3)
    { nombre: "Claudia", apellidos: "Lara Bustos", email: "claudia.lara@traduccion.com", cedula: "001-120722-8001A", inss: "INSS-801-2022", tel: "505-8800-8001", departamentoId: ids.deptoTraductores },
    { nombre: "Esteban", apellidos: "Quesada Marín", email: "esteban.quesada@traduccion.com", cedula: "001-250823-8002B", inss: "INSS-802-2023", tel: "505-8800-8002", departamentoId: ids.deptoTraductores },
    { nombre: "Andrea", apellidos: "Solís Cordero", email: "andrea.solis@traduccion.com", cedula: "001-080924-8003C", inss: "INSS-803-2024", tel: "505-8800-8003", departamentoId: ids.deptoTraductores },
  ];

  const workerIds: number[] = [];
  for (let i = 0; i < workerDefs.length; i++) {
    const wd = workerDefs[i]!;
    const wid = i + 1;
    workerIds.push(wid);
    const entryDate = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    await db.insert(trabajadores).values({
      id: wid, nombre: wd.nombre, apellidos: wd.apellidos,
      fechaEntrada: entryDate, email: wd.email,
      nacionalidadId: rnd(nacs), numeroInss: wd.inss,
      cedulaIdentidad: wd.cedula, telefono: wd.tel,
      saldoVacaciones: (Math.random() * 15 + 1).toFixed(2),
      tallaCamisaId: rnd(tallasC), tallaPantalonId: rnd(tallasP),
      tipoContratoId: rnd(contratos), cargoId: rnd([ids.cargoAnalista, ids.cargoDesarrollador, ids.cargoSecretario]),
      generoId: rnd(generosArr), horarioId: 1, activo: true,
      direccion: "Managua, Nicaragua",
      municipioId: Math.floor(Math.random() * 153) + 1,
    });
  }

  // ───── 8 esquelas de permisos ─────
  const hoy = new Date();
  const daysAgo = (n: number) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return d; };
  const esquelasRows = [
    { trabajadorId: workerIds[0], tipoPermisoId: ids.permisoVacaciones, cantidadDias: "5.00", fechaInicio: daysAgo(45), fechaFin: daysAgo(41), periodoCorrespondiente: "Abril 2026", fechaIncorporacion: daysAgo(40), observaciones: "Vacaciones solicitadas", estado: "aprobada" as const, aprobadoPor: adminUserId, cargo: "Analista", ubicacion: "Oficina Central" },
    { trabajadorId: workerIds[2], tipoPermisoId: ids.permisoPersonal, cantidadDias: "1.00", fechaInicio: daysAgo(30), fechaFin: daysAgo(30), periodoCorrespondiente: "Mayo 2026", fechaIncorporacion: daysAgo(29), estado: "pendiente" as const, cargo: "Analista", ubicacion: "Oficina Central" },
    { trabajadorId: workerIds[5], tipoPermisoId: ids.permisoEnfermedad, cantidadDias: "3.00", fechaInicio: daysAgo(20), fechaFin: daysAgo(18), periodoCorrespondiente: "Mayo 2026", fechaIncorporacion: daysAgo(17), observaciones: "Incapacidad médica", estado: "aprobada" as const, aprobadoPor: adminUserId, cargo: "Desarrollador", ubicacion: "Departamento de TI" },
    { trabajadorId: workerIds[8], tipoPermisoId: ids.permisoVacaciones, cantidadDias: "2.00", fechaInicio: daysAgo(10), fechaFin: daysAgo(9), periodoCorrespondiente: "Junio 2026", fechaIncorporacion: daysAgo(8), estado: "pendiente" as const, cargo: "Analista", ubicacion: "Cartera & Cobro" },
    { trabajadorId: workerIds[12], tipoPermisoId: ids.permisoPersonal, cantidadDias: "1.50", fechaInicio: daysAgo(55), fechaFin: daysAgo(54), periodoCorrespondiente: "Abril 2026", fechaIncorporacion: daysAgo(53), estado: "rechazada" as const, observaciones: "No cubre el turno", cargo: "Agente SAC", ubicacion: "SAC" },
    { trabajadorId: workerIds[15], tipoPermisoId: ids.permisoEnfermedad, cantidadDias: "4.00", fechaInicio: daysAgo(35), fechaFin: daysAgo(32), periodoCorrespondiente: "Mayo 2026", fechaIncorporacion: daysAgo(31), observaciones: "Reposo médico", estado: "aprobada" as const, aprobadoPor: adminUserId, cargo: "Contador", ubicacion: "Contabilidad" },
    { trabajadorId: workerIds[20], tipoPermisoId: ids.permisoVacaciones, cantidadDias: "7.00", fechaInicio: daysAgo(60), fechaFin: daysAgo(54), periodoCorrespondiente: "Abril 2026", fechaIncorporacion: daysAgo(53), estado: "pendiente" as const, cargo: "Analista", ubicacion: "Contabilidad" },
    { trabajadorId: workerIds[28], tipoPermisoId: ids.permisoPersonal, cantidadDias: "1.00", fechaInicio: daysAgo(25), fechaFin: daysAgo(25), periodoCorrespondiente: "Mayo 2026", fechaIncorporacion: daysAgo(24), estado: "rechazada" as const, observaciones: "Sin justificación", cargo: "Regente", ubicacion: "Regencia" },
  ];
  for (let i = 0; i < esquelasRows.length; i++) {
    await db.insert(esquelasPermisos).values({ id: i + 1, ...esquelasRows[i] } as any);
  }

  // ───── Link workers to planilla types ─────
  const planillasLinks = [
    { trabajadorId: workerIds[0], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[1], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[2], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[3], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[4], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[5], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[6], tipoPlanillaId: 3 },
    { trabajadorId: workerIds[7], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[8], tipoPlanillaId: 5 },
    { trabajadorId: workerIds[9], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[10], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[11], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[12], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[13], tipoPlanillaId: 5 },
    { trabajadorId: workerIds[14], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[15], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[16], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[17], tipoPlanillaId: 3 },
    { trabajadorId: workerIds[18], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[19], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[20], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[21], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[22], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[23], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[24], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[25], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[26], tipoPlanillaId: 5 },
    { trabajadorId: workerIds[27], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[28], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[29], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[30], tipoPlanillaId: 2 },
    { trabajadorId: workerIds[31], tipoPlanillaId: 1 },
    { trabajadorId: workerIds[32], tipoPlanillaId: 5 },
    { trabajadorId: workerIds[33], tipoPlanillaId: 4 },
    { trabajadorId: workerIds[34], tipoPlanillaId: 1 },
  ];
  for (const row of planillasLinks) {
    await db.insert(trabajadoresPlanillas).values(row as any);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
