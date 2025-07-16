import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";
import {
  type KeycloakProfile,
  extractRolesFromKeycloakData,
  decodeJWTPayload,
} from "../types/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid email profile roles",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.idToken = account.id_token;

        const keycloakProfile = profile as KeycloakProfile;
        const { roles, groups } = extractRolesFromKeycloakData(keycloakProfile);

        token.roles = roles;
        token.groups = groups;
      }

      if (token.accessToken && (!token.roles || token.roles.length === 0)) {
        const payload = decodeJWTPayload(token.accessToken as string);

        if (payload) {
          const { roles, groups } = extractRolesFromKeycloakData(payload);
          token.roles = roles;
          token.groups = groups;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      session.user.roles = (token.roles as string[]) || [];
      session.user.groups = (token.groups as string[]) || [];

      return session;
    },
  },
  pages: {
    signIn: "auth/signin",
    error: "auth/error",
    signOut: "auth/signout",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
