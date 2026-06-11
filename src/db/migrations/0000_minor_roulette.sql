CREATE TABLE `account` (
	`id` varchar(255) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`providerId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` timestamp NULL DEFAULT NULL,
	`refreshTokenExpiresAt` timestamp NULL DEFAULT NULL,
	`scope` text,
	`password` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`ipAddress` varchar(255),
	`userAgent` text,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`image` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`role` varchar(255) DEFAULT 'USER',
	`activo` boolean NOT NULL DEFAULT true,
	`nombre` varchar(255),
	`apellidos` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cargos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`unidad_negocio_id` int,
	`departamento_id` int,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `cargos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`unidad_negocio_id` int NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `departamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `generos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nacionalidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`codigo_iso` varchar(10),
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `nacionalidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planillas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`tipo` enum('quincenal','mensual','vehicular','administrativa','temporal') NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `planillas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tallas_camisa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `tallas_camisa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tallas_pantalon` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `tallas_pantalon_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_contrato` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `tipos_contrato_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_permisos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `tipos_permisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unidades_negocio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`descripcion` text,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `unidades_negocio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trabajadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`apellidos` varchar(255) NOT NULL,
	`fecha_entrada` date NOT NULL,
	`fecha_salida` date,
	`email` varchar(255) NOT NULL,
	`nacionalidad_id` int NOT NULL,
	`numero_inss` varchar(50) NOT NULL,
	`cedula_identidad` varchar(50) NOT NULL,
	`telefono` varchar(50) NOT NULL,
	`saldo_vacaciones` decimal(6,2) NOT NULL DEFAULT '0.00',
	`talla_camisa_id` int NOT NULL,
	`talla_pantalon_id` int NOT NULL,
	`direccion` text,
	`tipo_contrato_id` int NOT NULL,
	`cargo_id` int NOT NULL,
	`genero_id` int NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`foto` varchar(500),
	`salario_base` decimal(10,2) DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `trabajadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `trabajadores_email_unique` UNIQUE(`email`),
	CONSTRAINT `trabajadores_numero_inss_unique` UNIQUE(`numero_inss`),
	CONSTRAINT `trabajadores_cedula_identidad_unique` UNIQUE(`cedula_identidad`)
);
--> statement-breakpoint
CREATE TABLE `trabajadores_planillas` (
	`trabajador_id` int NOT NULL,
	`planilla_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `trabajadores_planillas_trabajador_id_planilla_id_pk` PRIMARY KEY(`trabajador_id`,`planilla_id`)
);
--> statement-breakpoint
CREATE TABLE `esquelas_permisos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fecha_elaborada` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`trabajador_id` int NOT NULL,
	`cargo` varchar(255),
	`ubicacion` varchar(255) NOT NULL,
	`tipo_permiso_id` int NOT NULL,
	`cantidad_dias` decimal(8,2) NOT NULL,
	`fecha_inicio` date NOT NULL,
	`fecha_fin` date NOT NULL,
	`periodo_correspondiente` varchar(255) NOT NULL,
	`fecha_incorporacion` date NOT NULL,
	`observaciones` text,
	`estado` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
	`aprobado_por` varchar(255),
	`firma_digital` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp NULL DEFAULT NULL,
	CONSTRAINT `esquelas_permisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cargos` ADD CONSTRAINT `cargos_unidad_negocio_id_unidades_negocio_id_fk` FOREIGN KEY (`unidad_negocio_id`) REFERENCES `unidades_negocio`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cargos` ADD CONSTRAINT `cargos_departamento_id_departamentos_id_fk` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departamentos` ADD CONSTRAINT `departamentos_unidad_negocio_id_unidades_negocio_id_fk` FOREIGN KEY (`unidad_negocio_id`) REFERENCES `unidades_negocio`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_nacionalidad_id_nacionalidades_id_fk` FOREIGN KEY (`nacionalidad_id`) REFERENCES `nacionalidades`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_talla_camisa_id_tallas_camisa_id_fk` FOREIGN KEY (`talla_camisa_id`) REFERENCES `tallas_camisa`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_talla_pantalon_id_tallas_pantalon_id_fk` FOREIGN KEY (`talla_pantalon_id`) REFERENCES `tallas_pantalon`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_tipo_contrato_id_tipos_contrato_id_fk` FOREIGN KEY (`tipo_contrato_id`) REFERENCES `tipos_contrato`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_cargo_id_cargos_id_fk` FOREIGN KEY (`cargo_id`) REFERENCES `cargos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores` ADD CONSTRAINT `trabajadores_genero_id_generos_id_fk` FOREIGN KEY (`genero_id`) REFERENCES `generos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores_planillas` ADD CONSTRAINT `trabajadores_planillas_trabajador_id_trabajadores_id_fk` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trabajadores_planillas` ADD CONSTRAINT `trabajadores_planillas_planilla_id_planillas_id_fk` FOREIGN KEY (`planilla_id`) REFERENCES `planillas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_trabajador_id_trabajadores_id_fk` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_tipo_permiso_id_tipos_permisos_id_fk` FOREIGN KEY (`tipo_permiso_id`) REFERENCES `tipos_permisos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `esquelas_permisos` ADD CONSTRAINT `esquelas_permisos_aprobado_por_user_id_fk` FOREIGN KEY (`aprobado_por`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`userId`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);