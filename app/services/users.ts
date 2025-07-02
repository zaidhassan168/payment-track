/**
 * User service for managing user data and roles
 */

/**
 * Get user data including role from Firestore
 * @param uid User ID
 */
export async function getUserData(uid: string) {
  try {
    const response = await fetch(`/api/users/role?uid=${uid}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Update a user's role in Firestore
 * @param uid User ID
 * @param role New role to assign
 */
export async function updateUserRole(uid: string, role: string) {
  try {
    const response = await fetch('/api/users/role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user role');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}
