export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  role?: string;
  activo?: boolean;
  nombre?: string;
  apellidos?: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  role?: string;
  activo?: boolean;
  nombre?: string;
  apellidos?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string | null;
  activo: boolean;
  nombre: string | null;
  apellidos: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
