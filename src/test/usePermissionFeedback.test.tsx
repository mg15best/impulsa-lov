import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissionFeedback } from "@/hooks/usePermissionFeedback";
import * as useUserRolesModule from "@/hooks/useUserRoles";

// Mock the useUserRoles hook
vi.mock("@/hooks/useUserRoles");

describe("usePermissionFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null message when user has write permissions", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["admin"],
      loading: false,
      isAdmin: true,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toBeNull();
    expect(result.current.canPerformAction("create")).toBe(true);
  });

  it("returns specific message for auditor role", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: false,
      canRead: true,
      roles: ["auditor"],
      loading: false,
      isAdmin: false,
      isTecnico: false,
      isAuditor: true,
      isIT: false,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toBe(
      "Los auditores tienen permisos de solo lectura"
    );
    expect(result.current.canPerformAction("create")).toBe(false);
  });

  it("returns specific message for IT role", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: false,
      canRead: true,
      roles: ["it"],
      loading: false,
      isAdmin: false,
      isTecnico: false,
      isAuditor: false,
      isIT: true,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toBe(
      "El personal de IT tiene permisos de solo lectura"
    );
    expect(result.current.canPerformAction("create")).toBe(false);
  });

  it("returns message when no roles assigned", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: false,
      canRead: false,
      roles: [],
      loading: false,
      isAdmin: false,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toBe(
      "Sin permisos asignados. Contacta al administrador"
    );
    expect(result.current.canPerformAction("create")).toBe(false);
  });

  it("returns different messages for different actions", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: false,
      canRead: true,
      roles: ["some_other_role"],
      loading: false,
      isAdmin: false,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toContain("crear");
    expect(result.current.getPermissionMessage("edit")).toContain("editar");
    expect(result.current.getPermissionMessage("delete")).toContain("eliminar");
  });

  it("allows tecnico to perform actions", () => {
    vi.spyOn(useUserRolesModule, "useUserRoles").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["tecnico"],
      loading: false,
      isAdmin: false,
      isTecnico: true,
      isAuditor: false,
      isIT: false,
    });

    const { result } = renderHook(() => usePermissionFeedback());

    expect(result.current.getPermissionMessage("create")).toBeNull();
    expect(result.current.canPerformAction("create")).toBe(true);
  });
});
