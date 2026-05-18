# Planilla-HR

Sistema web empresarial para la gestión de planilla y recursos humanos.

Moderno, escalable, modular, responsive y desarrollado con buenas prácticas de arquitectura, seguridad y base de datos normalizada hasta 3FN.

## Estructura del proyecto (72 archivos)

```
Plan-IA/
├── .env.example
├── .gitignore
├── astro.config.ts              # Configuración Astro + Node adapter + aliases
├── drizzle.config.ts            # Configuración Drizzle Kit
├── tsconfig.json                # TypeScript strict mode
├── package.json
├── README.md
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── auth/
│   │   └── index.ts             # better-auth + drizzle adapter + rol adicional
│   │
│   ├── middleware.ts            # Middleware global de autenticación (Astro)
│   ├── env.d.ts                 # Declaraciones de tipos para locals
│   │
│   ├── db/
│   │   ├── index.ts             # Pool MySQL + instancia Drizzle ORM
│   │   ├── seed.ts              # Seeders con datos de ejemplo (admin, trabajadores, etc.)
│   │   ├── schemas/
│   │   │   ├── index.ts         # Re-export central de todos los schemas
│   │   │   ├── catalogs.ts      # 9 tablas catálogo (tipos_contrato, cargos, etc.)
│   │   │   ├── workers.ts       # trabajadores + 6 FK + relaciones ORM
│   │   │   ├── workers_planillas.ts  # M:N trabajadores ↔ planillas
│   │   │   ├── users.ts         # usuarios del sistema
│   │   │   └── permits.ts       # esquelas_permisos + estados + FK
│   │   └── migrations/
│   │       ├── 0000_last_stingray.sql
│   │       └── meta/
│   │
│   ├── middleware/
│   │   ├── auth.ts              # getSession, requireAuth, requireRole
│   │   └── rbac.ts              # checkPermission, hasRole, isAdmin, isSupervisor
│   │
│   ├── utils/
│   │   ├── errors.ts            # AppError + NotFoundError, ValidationError, etc.
│   │   ├── response.ts          # successResponse, errorResponse, paginatedResponse
│   │   └── validators.ts        # Zod schemas + validateSchema helper
│   │
│   ├── modules/                 # ⚡ Clean Architecture por módulo
│   │   ├── auth/
│   │   │   ├── services/auth.service.ts   # login, logout, verifyPassword, hashPassword
│   │   │   └── types/index.ts             # LoginDTO, CreateUserDTO, UserResponse
│   │   ├── workers/
│   │   │   ├── services/worker.service.ts # Lógica de negocio + upload con sharp
│   │   │   ├── repositories/worker.repository.ts  # CRUD + búsqueda + paginación
│   │   │   ├── types/index.ts             # CreateWorkerDTO, WorkerResponse, filters
│   │   │   └── dto/worker.dto.ts          # Zod schemas de validación
│   │   ├── payrolls/
│   │   │   ├── services/payroll.service.ts
│   │   │   ├── repositories/payroll.repository.ts  # CRUD + asignar/remover trabajadores
│   │   │   └── types/index.ts
│   │   ├── permits/
│   │   │   ├── services/permits.service.ts # Lógica + PDF con jsPDF
│   │   │   ├── repositories/permits.repository.ts  # CRUD + approve/reject + filtros
│   │   │   └── types/index.ts
│   │   ├── catalogs/
│   │   │   ├── services/catalog.service.ts # Catálogo genérico + conteos
│   │   │   ├── repositories/catalog.repository.ts  # CRUD dinámico para 9 tablas
│   │   │   └── types/index.ts
│   │   └── dashboard/
│   │       └── services/dashboard.service.ts  # Estadísticas agregadas
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.astro           # Layout principal (sidebar + navbar + content)
│   │   │   ├── Sidebar.astro             # Sidebar colapsable responsive
│   │   │   └── Navbar.astro              # Barra superior con usuario y notificaciones
│   │   ├── ui/
│   │   │   ├── Button.astro              # 5 variantes, 3 tamaños, loading state
│   │   │   ├── Card.astro                # Card con header/body/footer slots
│   │   │   ├── Modal.astro               # Modal con backdrop, animación, focus trap
│   │   │   ├── DataTable.astro           # Tabla con sort, search, paginación, skeleton
│   │   │   ├── Badge.astro               # Badge con variantes de estado
│   │   │   ├── Alert.astro               # 4 variantes con íconos y dismiss
│   │   │   ├── FormField.astro           # Wrapper con label, error, helper text
│   │   │   └── EmptyState.astro          # Estado vacío para listas
│   │   └── shared/
│   │       ├── Pagination.astro          # Navegación de páginas con elipsis
│   │       ├── SearchInput.astro         # Input de búsqueda con debounce
│   │       └── ConfirmDialog.astro       # Diálogo de confirmación para eliminación
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro             # HTML base con meta, CSS, slots
│   │   └── AuthLayout.astro             # Layout centrado para login
│   │
│   ├── pages/                           # 🖥️ Páginas y API endpoints
│   │   ├── index.astro                  # Redirección → /dashboard
│   │   ├── login/index.astro            # Página de inicio de sesión
│   │   ├── dashboard/index.astro        # Panel de control con estadísticas
│   │   │
│   │   ├── workers/
│   │   │   ├── index.astro              # Lista + DataTable + modal crear/editar
│   │   │   ├── [id].astro               # Vista detalle del trabajador
│   │   │   └── _form.astro              # Formulario reutilizable
│   │   ├── payrolls/
│   │   │   ├── index.astro              # Lista + modal crear/editar
│   │   │   └── [id].astro               # Detalle + trabajadores asignados
│   │   ├── permits/
│   │   │   ├── index.astro              # Lista con filtros por estado
│   │   │   └── [id].astro               # Detalle + aprobar/rechazar
│   │   └── catalogs/
│   │       ├── index.astro              # Grid de catálogos con conteos
│   │       └── [type].astro             # CRUD genérico por tipo de catálogo
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...auth].ts             # Handler better-auth (POST/GET)
│       │   └── login.ts                 # Endpoint de login
│       ├── workers/
│       │   ├── index.ts                 # GET (lista) / POST (crear)
│       │   └── [id].ts                  # GET / PUT / DELETE
│       ├── payrolls/
│       │   ├── index.ts                 # GET / POST
│       │   ├── [id].ts                  # GET / PUT / DELETE
│       │   └── [id]/workers.ts          # POST (asignar) / DELETE (remover)
│       ├── permits/
│       │   ├── index.ts                 # GET / POST
│       │   ├── [id].ts                  # GET / PUT / DELETE
│       │   ├── [id]/approve.ts          # POST aprobar (SUPERVISOR+)
│       │   └── [id]/reject.ts           # POST rechazar (SUPERVISOR+)
│       └── catalogs/
│           ├── [type].ts                # GET / POST dinámico
│           └── [type]/[id].ts           # GET / PUT / DELETE
│
├── src/styles/
│   └── global.css                      # Tailwind v4 + tema personalizado ERP
└── src/styles/
    └── global.css                      # @import "tailwindcss" + colores personalizados
```

## Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| Astro | 6.3.3 |
| Tailwind CSS | 4.3 |
| MySQL | 8.0 |
| Drizzle ORM | ^0.45 |
| better-auth | ^1.6 |
| TypeScript | Strict mode |
| bcryptjs | ^3.0 |
| sharp | ^0.34 |
| @lucide/astro | ^1.14 |
| MinIO / AWS S3 | Compatible |

## Arquitectura

El proyecto sigue **Clean Architecture** con separación clara de responsabilidades:

```
src/
├── modules/       → Lógica de negocio por módulo (services, repositories, types, dto)
├── components/    → UI reutilizable (layout, ui, shared)
├── pages/         → Rutas y API endpoints
├── middleware/    → Autenticación y RBAC
├── db/            → Schemas Drizzle ORM, migraciones, seeders
├── utils/         → Helpers (errores, respuestas, validadores)
├── auth/          → Configuración better-auth
├── layouts/       → Layouts base
└── styles/        → Estilos globales Tailwind
```

### Patrones implementados
- **Repository Pattern** — Capa de acceso a datos desacoplada
- **Service Layer** — Lógica de negocio centralizada
- **DTOs + Zod** — Validación en frontend y backend
- **RBAC** — Control de acceso basado en roles (ADMIN, SUPERVISOR)
- **Soft Delete** — Eliminación lógica con `deleted_at`
- **UUID** — Primary keys con UUID v4
- **Auditoría** — `created_at`, `updated_at`, `deleted_at` en todas las tablas

## Base de Datos

Base de datos normalizada hasta **Tercera Forma Normal (3FN)** con 13 tablas:

### Catálogos (9)
- `tipos_contrato` — Tipos de contrato laboral
- `cargos` — Cargos empresariales
- `generos` — Géneros
- `nacionalidades` — Nacionalidades con código ISO
- `planillas` — Tipos de planilla (quincenal, mensual, vehicular, administrativa, temporal)
- `tallas_camisa` — Tallas de camisa
- `tallas_pantalon` — Tallas de pantalón
- `tipos_permisos` — Tipos de permisos laborales
- `roles` — Roles del sistema (ADMIN, SUPERVISOR)

### Tablas principales (4)
- `trabajadores` — Información completa del colaborador
- `trabajadores_planillas` — Relación M:N (un trabajador puede pertenecer a múltiples planillas)
- `usuarios` — Usuarios del sistema
- `esquelas_permisos` — Solicitudes de permisos laborales con workflow de aprobación

## Módulos

### 1. Gestión de Trabajadores
- CRUD completo con soft delete
- Búsqueda y filtros por múltiples criterios
- Foto de perfil con optimización sharp (400x400)
- Relación M:N con planillas
- Validación de duplicados (email, INSS, cédula)

### 2. Gestión de Planillas
- CRUD completo
- Asignación y desasignación de trabajadores
- Tipos: quincenal, mensual, vehicular, administrativa, temporal
- Vista detalle con trabajadores asignados

### 3. Autenticación y Usuarios
- better-auth con sesiones seguras
- Contraseñas encriptadas con bcryptjs
- RBAC con roles ADMIN y SUPERVISOR
- Middleware de autenticación y protección de rutas
- Login con redirect

### 4. Esquelas de Permisos
- Solicitud de permisos laborales
- Workflow: Pendiente → Aprobada / Rechazada
- Aprobación solo para SUPERVISOR y ADMIN
- Generación de PDF en aprobación
- Firma digital simple
- Historial de solicitudes

### 5. Catálogos
- CRUD genérico para los 9 catálogos
- Activación/desactivación de registros
- Interfaz unificada de administración

### 6. Dashboard
- Panel de control con estadísticas en tiempo real
- Tarjetas resumen (trabajadores, planillas, permisos)
- Gráficos de distribución (por contrato, por género)
- Tablas de registros recientes
- Accesos rápidos a las principales acciones

## Interfaz de Usuario

- Diseño profesional estilo ERP administrativo
- Sidebar colapsable y responsive
- Dark mode incluido
- DataTables con paginación, búsqueda y ordenamiento
- Modales para creación y edición
- Alertas contextuales (éxito, error, advertencia, información)
- Confirmación para eliminación
- Formularios con validación visual

## Seguridad

- Autenticación mediante better-auth con sesiones HTTP-only
- RBAC con jerarquía: ADMIN > SUPERVISOR
- Middleware de protección en rutas y API
- Validación de datos con Zod (frontend y backend)
- Soft delete para prevención de pérdida de datos
- Prepared statements vía Drizzle ORM (SQL injection prevention)
- Auditoría completa de cambios

## Inicio Rápido

```bash
# Requisitos
# - Node.js 22+
# - MySQL 8.0+
# - npm 10+

# Clonar e instalar
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales MySQL

# Generar y ejecutar migraciones
npm run db:generate
npm run db:migrate

# Poblar datos de ejemplo
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

### Credenciales por defecto

```
Email:    admin@planilla.com
Password: Admin123!
Rol:      ADMIN
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza build de producción |
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:migrate` | Ejecuta migraciones |
| `npm run db:push` | Push directo del schema a DB |
| `npm run db:seed` | Pobla la base de datos con datos de ejemplo |
| `npm run db:studio` | Abre Drizzle Studio |
| `npm run typecheck` | Verificación de tipos TypeScript |

## Licencia

MIT
