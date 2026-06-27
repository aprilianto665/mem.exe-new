import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        googleToken: { label: "Google Token", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        // 1. Check if this is a Google Sign-In request
        if (credentials?.googleToken) {
          const idToken = credentials.googleToken;
          const isSignUp = credentials.isSignUp === "true";

          try {
            // Verify token with Google's API
            const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (!res.ok) {
              throw new Error("Google authentication failed");
            }
            const info = await res.json();
            if (!info.email) {
              throw new Error("Invalid Google token: email missing");
            }

            const email = info.email.toLowerCase();

            // Find user in database
            let user = await prisma.users.findUnique({
              where: { email },
              include: { user_auth_providers: true },
            });

            if (!user) {
              if (!isSignUp) {
                throw new Error("email not registered");
              }

              // Register Google OAuth user automatically
              const fullName = info.name || email.split("@")[0];
              user = await prisma.users.create({
                data: {
                  email,
                  full_name: fullName,
                  email_verified_at: new Date(),
                  user_auth_providers: {
                    create: {
                      provider: "google",
                      provider_id: info.sub,
                    },
                  },
                },
                include: { user_auth_providers: true },
              });
            } else {
              // Verify email if it isn't verified yet
              if (!user.email_verified_at) {
                user = await prisma.users.update({
                  where: { id: user.id },
                  data: { email_verified_at: new Date() },
                  include: { user_auth_providers: true },
                });
              }

              // Check if Google auth provider is linked, if not link it
              const hasGoogle = user.user_auth_providers.some(
                (p: any) => p.provider === "google"
              );
              if (!hasGoogle) {
                await prisma.user_auth_providers.create({
                  data: {
                    user_id: user.id,
                    provider: "google",
                    provider_id: info.sub,
                  },
                });
              }
            }

            return {
              id: user.id,
              name: user.full_name,
              email: user.email,
            };
          } catch (err: any) {
            throw new Error(err.message || "Google login failed");
          }
        }

        // 2. Normal Email/Password Sign-In
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase();

        const user = await prisma.users.findUnique({
          where: { email },
          include: { user_auth_providers: true },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const localProvider = user.user_auth_providers.find(
          (p: any) => p.provider === "local"
        );
        if (!localProvider || !localProvider.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          localProvider.password
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.email_verified_at) {
          throw new Error("Email not verified");
        }

        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days (1 month)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
