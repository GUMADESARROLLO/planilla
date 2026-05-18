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

export async function login(data: LoginDTO): Promise<{ user: UserResponse; token: string }> {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      },
    }) as unknown as Record<string, unknown>;

    if (!result) {
      throw new UnauthorizedError("Error al iniciar sesión");
    }

    const user = result["user"] as Record<string, unknown>;
    const session = result["session"] as Record<string, unknown> | undefined;
    const token = session?.["token"] as string ?? result["token"] as string;

    if (!token) {
      throw new UnauthorizedError("Error al obtener token de sesión");
    }

    return {
      user: mapUser(user),
      token,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
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
