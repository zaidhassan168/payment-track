/**
 * Utility functions for consistent API responses
 */

import { NextResponse } from 'next/server';

type ErrorResponse = {
  error: string;
  details?: any;
};

type SuccessResponse = {
  success: boolean;
  message?: string;
  [key: string]: any;
};

/**
 * Create a standard error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  console.error(`API Error (${status}):`, message, details);

  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {})
    },
    { status }
  );
}

/**
 * Create a standard success response
 * @param data Response data
 * @param status HTTP status code
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Handle common Firebase authentication errors
 * @param error Firebase Auth error
 * @param uid User ID for context
 */
export function handleFirebaseAuthError(error: any, uid?: string): NextResponse<ErrorResponse> {
  const errorCode = error.code || 'unknown-error';
  const context = uid ? ` (UID: ${uid})` : '';

  // Handle common Firebase Auth errors
  switch (errorCode) {
    case 'auth/user-not-found':
      return errorResponse(`User not found${context}`, 404);
    case 'auth/id-token-expired':
      return errorResponse(`Authentication token expired${context}`, 401);
    case 'auth/invalid-credential':
    case 'auth/invalid-id-token':
      return errorResponse(`Invalid authentication${context}`, 401);
    default:
      return errorResponse(`Authentication error: ${error.message || errorCode}${context}`, 500);
  }
}
