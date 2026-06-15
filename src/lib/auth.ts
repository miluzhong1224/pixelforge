import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { findUserByEmail } from './supabase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called, email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] FAIL: missing credentials');
          return null;
        }

        try {
          console.log('[AUTH] looking up user...');
          const user = await findUserByEmail(credentials.email as string);
          if (!user) {
            console.log('[AUTH] FAIL: user not found');
            return null;
          }
          console.log('[AUTH] user found, comparing password...');

          const isValid = await compare(
            credentials.password as string,
            user.password_hash
          );
          if (!isValid) {
            console.log('[AUTH] FAIL: password mismatch');
            return null;
          }

          console.log('[AUTH] SUCCESS, returning user');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar_url,
          };
        } catch (err) {
          console.log('[AUTH] FAIL: exception -', err instanceof Error ? err.message : String(err));
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
