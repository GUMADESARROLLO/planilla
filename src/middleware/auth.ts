import type { APIContext } from "astro";
import { auth } from "@/auth";
import { UnauthorizedError, ForbiddenError } from "@utils/errors";

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string | null;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

export async function getSession(request: Request): Promise<UserSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) return null;
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: ((session.user as Record<string, unknown>)["role"] as string) ?? "USER",
        image: session.user.image,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
        token: session.session.token,
      },
    };
  } catch {
    return null;
  }
}

export async function requireAuth(context: APIContext): Promise<UserSession> {
  const session = await getSession(context.request);
  if (!session) {
    if (context.url.pathname.startsWith("/api/")) {
      throw new UnauthorizedError("Authentication required");
    }
    throw new UnauthorizedError("Authentication required");
  }
  return session;
}

export function requireRole(...roles: string[]) {
  return async (context: APIContext): Promise<UserSession> => {
    const session = await requireAuth(context);
    if (!roles.includes(session.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    return session;
  };
}
