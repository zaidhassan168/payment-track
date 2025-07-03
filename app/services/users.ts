/**
 * Client-side user service for managing user data and roles
 */
import { FirebaseUser, UpdateUserData, CreateUserData } from '@/types/user';

/**
 * Generic API request handler to reduce duplication
 */
async function apiRequest<T>(
  url: string,
  method: string = 'GET',
  body?: any
): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
}

/**
 * Get user data including role from Firestore
 * @param uid User ID
 */
export async function getUserData(uid: string) {
  return apiRequest(`/api/users/role?uid=${uid}`);
}

/**
 * Update a user's role in Firestore
 * @param uid User ID
 * @param role New role to assign
 */
export async function updateUserRole(uid: string, role: string) {
  return apiRequest('/api/users/role', 'PATCH', { uid, role });
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<FirebaseUser[]> {
  return apiRequest('/api/users');
}

/**
 * Get a single user by ID
 */
export async function getUserById(uid: string): Promise<FirebaseUser> {
  return apiRequest(`/api/users/${uid}`);
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserData): Promise<FirebaseUser> {
  return apiRequest('/api/users', 'POST', userData);
}

/**
 * Update user data
 */
export async function updateUser(uid: string, userData: UpdateUserData): Promise<FirebaseUser> {
  return apiRequest(`/api/users/${uid}`, 'PUT', userData);
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<{message: string}> {
  return apiRequest(`/api/users/${uid}`, 'DELETE');
}
