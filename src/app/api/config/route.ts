import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const config = {
      keycloakClientId:
        process.env.KEYCLOAK_CLIENT_ID_PUBLIC || process.env.KEYCLOAK_CLIENT_ID,
      keycloakIssuer: process.env.KEYCLOAK_ISSUER,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error getting runtime config:", error);
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}
