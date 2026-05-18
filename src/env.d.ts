/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image?: string | null;
      activo: boolean;
      nombre?: string | null;
      apellidos?: string | null;
    } | null;
    session: {
      id: string;
      expiresAt: Date;
      token: string;
    } | null;
  }
}
