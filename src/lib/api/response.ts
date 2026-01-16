import type { ApiResponse, PaginationInfo } from '@/types';

/**
 * Create a successful API response with optional pagination
 */
export function successResponse<T>(
  data: T,
  pagination?: PaginationInfo
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    pagination,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  return Response.json(response);
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400
): Response {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  return Response.json(response, { status });
}
