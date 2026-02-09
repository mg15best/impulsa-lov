import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Grants from "@/pages/Grants";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
    loading: false,
  }),
}));

vi.mock("@/hooks/useUserRoles", () => ({
  useUserRoles: () => ({
    canWrite: true,
    canRead: true,
    isAdmin: false,
    isTecnico: true,
  }),
}));

vi.mock("@/hooks/useDataLoader", () => ({
  useDataLoader: () => ({
    data: [],
    loading: false,
    reload: vi.fn(),
  }),
  useLocalSearch: (data: unknown[], _searchTerm: string) => data,
}));

vi.mock("@/hooks/useCatalog", () => ({
  useCatalog: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCatalogLookup: () => ({
    lookup: new Map(),
    isLoading: false,
  }),
  resolveLabelFromLookup: (_lookup: Map<string, string>, code: string) => code,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/grants" }),
}));

describe("Grants Page", () => {
  it("renders the page title", () => {
    render(<Grants />);
    expect(screen.getByText("Subvenciones")).toBeInTheDocument();
  });

  it("renders the page description", () => {
    render(<Grants />);
    expect(screen.getByText("Gestiona las subvenciones y solicitudes por empresa")).toBeInTheDocument();
  });

  it("renders the new grant button", () => {
    render(<Grants />);
    expect(screen.getByText("Nueva Subvención")).toBeInTheDocument();
  });

  it("renders the filters section", () => {
    render(<Grants />);
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("renders the grants list table", () => {
    render(<Grants />);
    expect(screen.getByText("Lista de Subvenciones")).toBeInTheDocument();
  });

  it("shows empty state when no grants", () => {
    render(<Grants />);
    expect(screen.getByText("No se encontraron subvenciones")).toBeInTheDocument();
  });
});
