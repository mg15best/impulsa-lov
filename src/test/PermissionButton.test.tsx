import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionButton } from "@/components/PermissionButton";
import * as usePermissionFeedbackModule from "@/hooks/usePermissionFeedback";

// Mock the usePermissionFeedback hook
vi.mock("@/hooks/usePermissionFeedback");

describe("PermissionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders button with children when user has permissions", () => {
    vi.spyOn(usePermissionFeedbackModule, "usePermissionFeedback").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["admin"],
      isAdmin: true,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
      getPermissionMessage: () => null,
      canPerformAction: () => true,
    });

    render(<PermissionButton action="create">Test Button</PermissionButton>);

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("disables button when user lacks permissions", () => {
    vi.spyOn(usePermissionFeedbackModule, "usePermissionFeedback").mockReturnValue({
      canWrite: false,
      canRead: true,
      roles: ["auditor"],
      isAdmin: false,
      isTecnico: false,
      isAuditor: true,
      isIT: false,
      getPermissionMessage: () => "Los auditores tienen permisos de solo lectura",
      canPerformAction: () => false,
    });

    render(<PermissionButton action="create">Test Button</PermissionButton>);

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeDisabled();
  });

  it("disables button when additional conditions are not met", () => {
    vi.spyOn(usePermissionFeedbackModule, "usePermissionFeedback").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["admin"],
      isAdmin: true,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
      getPermissionMessage: () => null,
      canPerformAction: () => true,
    });

    render(
      <PermissionButton
        action="create"
        additionalDisabled={true}
        additionalDisabledMessage="Primero debes crear al menos una empresa"
      >
        Test Button
      </PermissionButton>
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeDisabled();
  });

  it("enables button when user has permissions and additional conditions are met", () => {
    vi.spyOn(usePermissionFeedbackModule, "usePermissionFeedback").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["tecnico"],
      isAdmin: false,
      isTecnico: true,
      isAuditor: false,
      isIT: false,
      getPermissionMessage: () => null,
      canPerformAction: () => true,
    });

    render(
      <PermissionButton
        action="create"
        additionalDisabled={false}
        additionalDisabledMessage="Primero debes crear al menos una empresa"
      >
        Test Button
      </PermissionButton>
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).not.toBeDisabled();
  });

  it("respects external disabled prop", () => {
    vi.spyOn(usePermissionFeedbackModule, "usePermissionFeedback").mockReturnValue({
      canWrite: true,
      canRead: true,
      roles: ["admin"],
      isAdmin: true,
      isTecnico: false,
      isAuditor: false,
      isIT: false,
      getPermissionMessage: () => null,
      canPerformAction: () => true,
    });

    render(
      <PermissionButton action="create" disabled={true}>
        Test Button
      </PermissionButton>
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeDisabled();
  });
});
