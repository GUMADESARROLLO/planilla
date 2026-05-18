import { defineMiddleware } from "astro:middleware";
import { auth } from "@/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (session) {
    context.locals.user = session.user as App.Locals["user"];
    context.locals.session = session.session as App.Locals["session"];
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  const publicPaths = ["/login", "/api/auth"];
  const isPublic = publicPaths.some((p) => context.url.pathname.startsWith(p));
  const isApi = context.url.pathname.startsWith("/api");

  if (!session && !isPublic && !isApi) {
    return context.redirect("/login");
  }

  return next();
});
