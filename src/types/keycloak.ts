export interface KeycloakRealmAccess {
  roles: string[];
}

export interface KeycloakResourceAccess {
  [key: string]: {
    roles: string[];
  };
}

export interface KeycloakProfile {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: KeycloakRealmAccess;
  resource_access?: KeycloakResourceAccess;
  roles?: string[];
  groups?: string[];
}

export interface KeycloakTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: KeycloakRealmAccess;
  resource_access?: KeycloakResourceAccess;
  roles?: string[];
  groups?: string[];
  iat?: number;
  exp?: number;
  aud?: string | string[];
  iss?: string;
}

export function extractRolesFromKeycloakData(
  data: KeycloakProfile | KeycloakTokenPayload
): {
  roles: string[];
  groups: string[];
} {
  let roles: string[] = [];
  let groups: string[] = [];

  if (data.realm_access?.roles) {
    roles = [...roles, ...data.realm_access.roles];
  }

  if (data.resource_access) {
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    if (clientId && data.resource_access[clientId]?.roles) {
      roles = [...roles, ...data.resource_access[clientId].roles];
    }

    if (data.resource_access.account?.roles) {
      roles = [...roles, ...data.resource_access.account.roles];
    }
  }

  if (data.roles) {
    roles = [...roles, ...data.roles];
  }

  if (data.groups) {
    groups = data.groups;
  }

  const defaultRoles = [
    "default-roles-master",
    "offline_access",
    "uma_authorization",
  ];

  const uniqueRoles = [...new Set(roles)].filter(
    (role) => !defaultRoles.includes(role)
  );
  const uniqueGroups = [...new Set(groups)];

  return { roles: uniqueRoles, groups: uniqueGroups };
}

export function decodeJWTPayload(token: string): KeycloakTokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as KeycloakTokenPayload;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error decoding JWT token:", error);
    }
    return null;
  }
}
