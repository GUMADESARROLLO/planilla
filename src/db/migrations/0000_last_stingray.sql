CREATE TABLE `cargos` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `cargos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generos` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `generos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nacionalidades` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`codigo_iso` varchar(10),
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `nacionalidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planillas` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`tipo` enum('quincenal','mensual','vehicular','administrativa','temporal') NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `planillas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tallas_camisa` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tallas_camisa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tallas_pantalon` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tallas_pantalon_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_contrato` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tipos_contrato_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_permisos` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tipos_permisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trabajadores` (
	`id` char(36) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`apellidos` varchar(255) NOT NULL,
	`fecha_entrada` date NOT NULL,
	`fecha_salida` date,
	`email` varchar(255) NOT NULL,
	`nacionalidad_id` char(36) NOT NULL,
	`numero_inss` varchar(50) NOT NULL,
	`cedula_identidad` varchar(50) NOT NULL,
	`telefono` varchar(50) NOT NULL,
	`saldo_vacaciones` decimal(6,2) NOT NULL DEFAULT '0.00',
	`talla_camisa_id` char(36) NOT NULL,
	`talla_pantalon_id` char(36) NOT NULL,
	`direccion` text,
	`tipo_contrato_id` char(36) NOT NULL,
	`cargo_id` char(36) NOT NULL,
	`genero_id` char(36) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`foto` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `trabajadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `trabajadores_email_unique` UNIQUE(`email`),
	CONSTRAINT `trabajadores_numero_inss_unique` UNIQUE(`numero_inss`),
	CONSTRAINT `trabajadores_cedula_identidad_unique` UNIQUE(`cedula_identidad`)
);
--> statement-breakpoint
CREATE TABLE `trabajadores_planillas` (
	`trabajador_id` char(36) NOT NULL,
	`planilla_id` char(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trabajadores_planillas_trabajador_id_planilla_id_pk` PRIMARY KEY(`trabajador_id`,`planilla_id`)
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` char(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`apellidos` varchar(255) NOT NULL,
	`rol_id` char(36) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`foto` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `usuarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `esquelas_permisos` (
	`id` char(36) NOT NULL,
	`fecha_elaborada` timestamp NOT NULL DEFAULT (now()),
	`trabajador_id` char(36) NOT NULL,
	`cargo` varchar(255),
	`ubicacion` varchar(255) NOT NULL,
	`tipo_permiso_id` char(36) NOT NULL,
	`cantidad_dias` int NOT NULL,
	`periodo_correspondiente` varchar(255) NOT NULL,
	`fecha_incorporacion` date NOT NULL,
	`observaciones` text,
	`estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
	`aprobado_por` char(36),
	`firma_digital` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `esquelas_permisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_nacionalidad_id_nacionalidades_id_fk` FOREIGN KEY (`nacionalidad_id`) REFERENCES `nacionalidades`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_talla_camisa_id_tallas_camisa_id_fk` FOREIGN KEY (`talla_camisa_id`) REFERENCES `tallas_camisa`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_talla_pantalon_id_tallas_pantalon_id_fk` FOREIGN KEY (`talla_pantalon_id`) REFERENCES `tallas_pantalon`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_tipo_contrato_id_tipos_contrato_id_fk` FOREIGN KEY (`tipo_contrato_id`) REFERENCES `tipos_contrato`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_cargo_id_cargos_id_fk` FOREIGN KEY (`cargo_id`) REFERENCES `cargos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_genero_id_generos_id_fk` FOREIGN KEY (`genero_id`) REFERENCES `generos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores_planillas` ADD CONSTRAINT `trabajadores_planillas_trabajador_id_trabajadores_id_fk` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores_planillas` ADD CONSTRAINT `trabajadores_planillas_planilla_id_planillas_id_fk` FOREIGN KEY (`planilla_id`) REFERENCES `planillas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_roles_id_fk` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_trabajador_id_trabajadores_id_fk` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_tipo_permiso_id_tipos_permisos_id_fk` FOREIGN KEY (`tipo_permiso_id`) REFERENCES `tipos_permisos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_aprobado_por_usuarios_id_fk` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;