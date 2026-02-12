import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Informes from "@/pages/Informes";

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
  useLocalSearch: <T,>(data: T[], _searchTerm: string) => data,
}));

vi.mock("@/hooks/useCatalog", () => ({
  useCatalogLookup: () => ({
    lookup: new Map(),
    isLoading: false,
  }),
  resolveLabelFromLookup: (lookup: Map<string, string>, code: string) => code,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/informes" }),
}));

describe("Informes Page", () => {
  it("renders the page title", () => {
    render(<Informes />);
    expect(screen.getByText("Informes")).toBeInTheDocument();
  });

  it("renders the new report button", () => {
    render(<Informes />);
    expect(screen.getByText("Nuevo Informe")).toBeInTheDocument();
  });

  it("renders the search and filter section", () => {
    render(<Informes />);
    expect(screen.getByText("Filtros y Búsqueda")).toBeInTheDocument();
  });

  it("renders the reports list table", () => {
    render(<Informes />);
    expect(screen.getByText("Lista de Informes")).toBeInTheDocument();
  });

  it("shows empty state when no reports", () => {
    render(<Informes />);
    expect(screen.getByText("No se encontraron informes")).toBeInTheDocument();
  });
});
