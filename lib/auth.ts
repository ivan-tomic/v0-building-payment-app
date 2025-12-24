import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email i lozinka su obavezni')
        }

        try {
          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1)

          if (!user) {
            throw new Error('Korisnik nije pronađen')
          }

          if (!user.isActive) {
            throw new Error('Nalog je deaktiviran')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isValidPassword) {
            throw new Error('Pogrešna lozinka')
          }

          // Return user object (this becomes the JWT token payload)
          return {
            id: String(user.id),
            email: user.email,
            name: user.fullName,
            role: user.role,
            apartmentId: user.apartmentId,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.apartmentId = user.apartmentId
      }
      return token
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'tenant'
        session.user.apartmentId = token.apartmentId as number | null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    id: string
    role: 'admin' | 'tenant'
    apartmentId: number | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'tenant'
      apartmentId: number | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'tenant'
    apartmentId: number | null
  }
}
