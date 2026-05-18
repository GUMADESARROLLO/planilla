import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { UnauthorizedError } from "@utils/errors";
import type { LoginDTO, UserResponse } from "../types";

function mapUser(user: Record<string, unknown>): UserResponse {
  return {
    id: user["id"] as string,
    email: user["email"] as string,
    name: user["name"] as string,
    role: (user["role"] as string) ?? "USER",
    image: (user["image"] as string | null) ?? null,
    createdAt: user["createdAt"] as Date,
    updatedAt: user["updatedAt"] as Date,
  };
}

export async function login(data: LoginDTO): Promise<{ user: UserResponse; token: string; headers: Headers }> {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      },
      returnHeaders: true,
      returnStatus: true,
    }) as { headers: Headers; response: Record<string, unknown>; status: number };

    if (!result?.response) {
      throw new UnauthorizedError("Error al iniciar sesión");
    }

    const user = result.response["user"] as Record<string, unknown>;
    const token = result.response["token"] as string;

    if (!token) {
      throw new UnauthorizedError("Error al obtener token de sesión");
    }

    return {
      user: mapUser(user),
      token,
      headers: result.headers,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    console.error("[login error]", error);
    throw new UnauthorizedError("Correo electrónico o contraseña inválidos");
  }
}

export async function logout(token: string): Promise<void> {
  try {
    const api = auth.api as never;
    const revoke = api["revokeSession"] as ((args: { body: { token: string } }) => Promise<void>) | undefined;
    if (revoke) await revoke({ body: { token } });
  } catch {
    // Session already invalid or expired
  }
}

export async function getCurrentUser(sessionToken: string): Promise<UserResponse | null> {
  try {
    const session = await auth.api.getSession({
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });
    if (!session) return null;
    return mapUser(session["user"] as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function verifyPassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
