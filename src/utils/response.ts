import { AppError, type ErrorResponse, type SuccessResponse } from "./errors";

export function successResponse<T>(data: T, meta?: SuccessResponse["meta"]): Response {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(error: AppError): Response {
  const body: ErrorResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    },
  };
  return new Response(JSON.stringify(body), {
    status: error.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number): Response {
  const totalPages = Math.ceil(total / limit);
  return successResponse(data, { page, limit, total, totalPages });
}
