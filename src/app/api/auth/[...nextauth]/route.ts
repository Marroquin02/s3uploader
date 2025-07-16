import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";

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

        let roles: string[] = [];
        let groups: string[] = [];

        if ((profile as any).realm_access?.roles) {
          roles = [...roles, ...(profile as any).realm_access.roles];
        }

        if ((profile as any).resource_access) {
          const clientId = process.env.KEYCLOAK_CLIENT_ID;
          if (clientId && (profile as any).resource_access[clientId]?.roles) {
            roles = [
              ...roles,
              ...(profile as any).resource_access[clientId].roles,
            ];
          }

          if ((profile as any).resource_access.account?.roles) {
            roles = [
              ...roles,
              ...(profile as any).resource_access.account.roles,
            ];
          }
        }

        if ((profile as any).roles) {
          roles = [...roles, ...(profile as any).roles];
        }

        if ((profile as any).groups) {
          groups = (profile as any).groups;
        }

        const defaultRoles = [
          "default-roles-master",
          "offline_access",
          "uma_authorization",
        ];
        token.roles = [...new Set(roles)].filter(
          (role) => !defaultRoles.includes(role)
        );
        token.groups = [...new Set(groups)];
      }

      if (token.accessToken && !token.roles?.length) {
        try {
          const base64Url = (token.accessToken as string).split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);

          let roles: string[] = [];
          let groups: string[] = [];

          if (payload.realm_access?.roles) {
            roles = [...roles, ...payload.realm_access.roles];
          }

          if (payload.resource_access) {
            const clientId = process.env.KEYCLOAK_CLIENT_ID;
            if (clientId && payload.resource_access[clientId]?.roles) {
              roles = [...roles, ...payload.resource_access[clientId].roles];
            }
          }

          if (payload.groups) {
            groups = payload.groups;
          }

          const defaultRoles = [
            "default-roles-master",
            "offline_access",
            "uma_authorization",
          ];
          token.roles = [...new Set(roles)].filter(
            (role) => !defaultRoles.includes(role)
          );
          token.groups = [...new Set(groups)];
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error decoding access token:", error);
          }
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
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
