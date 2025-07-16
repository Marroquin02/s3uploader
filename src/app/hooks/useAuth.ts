"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  const authState = useMemo(() => {
    return {
      isAuthenticated: !!session,
      isLoading: status === "loading",
      user: session?.user,
      roles: session?.user?.roles || [],
      groups: session?.user?.groups || [],
      accessToken: session?.accessToken,
    };
  }, [session, status]);

  return authState;
}

export function useAuthorization() {
  const { roles, groups, isAuthenticated } = useAuth();

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some((role) => roles.includes(role));
  };

  const hasAllRoles = (roleList: string[]): boolean => {
    return roleList.every((role) => roles.includes(role));
  };

  const hasGroup = (group: string): boolean => {
    return groups.includes(group);
  };

  const hasAnyGroup = (groupList: string[]): boolean => {
    return groupList.some((group) => groups.includes(group));
  };

  const hasAllGroups = (groupList: string[]): boolean => {
    return groupList.every((group) => groups.includes(group));
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(["admin", "administrator"]);
  };

  const canUpload = (): boolean => {
    return (
      isAuthenticated && hasAnyRole(["uploader", "admin", "administrator"])
    );
  };

  const canDelete = (): boolean => {
    return (
      isAuthenticated && hasAnyRole(["admin", "administrator", "moderator"])
    );
  };

  const canManageUsers = (): boolean => {
    return isAuthenticated && hasAnyRole(["admin", "administrator"]);
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasGroup,
    hasAnyGroup,
    hasAllGroups,
    isAdmin,
    canUpload,
    canDelete,
    canManageUsers,
    roles,
    groups,
    isAuthenticated,
  };
}
