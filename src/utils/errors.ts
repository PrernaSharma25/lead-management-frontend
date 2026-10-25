import axios from 'axios';
import { ApiErrorDetail, ApiErrorResponse } from '../types/lead.types';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: ApiErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isRequestCanceled(error: unknown): boolean {
  if (!error) return false;
  if (axios.isCancel(error)) return true;
  if (error instanceof Error) {
    if (
      error.name === 'CanceledError' ||
      error.name === 'AbortError' ||
      error.message === 'canceled' ||
      error.message?.includes('canceled') ||
      error.message?.includes('aborted')
    ) {
      return true;
    }
  }
  return false;
}

export function formatErrorMessage(error: unknown): string {
  if (isRequestCanceled(error)) {
    return 'Request was canceled';
  }

  if (isApiError(error)) {
    if (error.details && error.details.length > 0) {
      const fieldDetails = error.details
        .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
        .join(', ');
      return `${error.message} (${fieldDetails})`;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function parseAxiosErrorData(status: number, data: unknown): ApiError {
  if (data && typeof data === 'object' && 'error' in data) {
    const errorData = (data as ApiErrorResponse).error;
    return new ApiError(
      status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || 'Request failed',
      errorData.details,
    );
  }

  return new ApiError(
    status,
    'HTTP_ERROR',
    status === 404
      ? 'Requested resource not found'
      : status === 409
        ? 'A conflicting record already exists'
        : 'Request failed with status ' + status,
  );
}
