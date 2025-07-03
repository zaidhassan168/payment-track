export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
  disabled: boolean;
  role?: string;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  displayName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}
