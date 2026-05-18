import { auth } from "@/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  return auth.handler(request);
};

export const GET: APIRoute = async ({ request }) => {
  return auth.handler(request);
};
