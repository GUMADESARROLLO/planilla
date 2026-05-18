export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
  image?: string | null;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  role?: string;
  image?: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  token: string;
  expiresAt: Date;
}
