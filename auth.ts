
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { firestore } from "@/lib/firestore"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  
  callbacks: {
    
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
  },
})


