export interface ApiSuccessResponse<T> {
  responseCode: number;
  errorObj: null;
  data: T;
}

export interface ApiErrorResponse {
  responseCode: number;
  errorObj: {
    code: string;
    message: string;
  };
  data: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(data: T, responseCode = 200): ApiSuccessResponse<T> {
  return { responseCode, errorObj: null, data };
}

export function apiError(
  message: string,
  code = 'BUSINESS_ERROR',
  responseCode = 417,
): ApiErrorResponse {
  return {
    responseCode,
    errorObj: { code, message },
    data: null,
  };
}
