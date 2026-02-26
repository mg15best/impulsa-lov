import { describe, expect, it } from "vitest";
import { getMissingColumnFromError, safeInsertWithSchemaFallback } from "@/lib/supabaseInsert";

describe("getMissingColumnFromError", () => {
  it("extracts the missing column for the matching table", () => {
    const message = "Could not find the 'codigo_origen_lead' column of 'empresas' in the schema cache";

    expect(getMissingColumnFromError(message, "empresas")).toBe("codigo_origen_lead");
  });

  it("returns null when table does not match", () => {
    const message = "Could not find the 'codigo_origen_lead' column of 'empresas' in the schema cache";

    expect(getMissingColumnFromError(message, "contactos")).toBeNull();
  });
});

describe("safeInsertWithSchemaFallback", () => {
  it("returns success on first attempt when insert works", async () => {
    const payload = { nombre: "Empresa A", created_by: "user-id" };

    const response = await safeInsertWithSchemaFallback({
      tableName: "empresas",
      payload,
      insertFn: async () => ({
        data: { id: "1", nombre: "Empresa A" },
        error: null,
      }),
    });

    expect(response.data).toEqual({ id: "1", nombre: "Empresa A" });
    expect(response.error).toBeNull();
    expect(response.attempts).toBe(1);
    expect(response.removedColumns).toEqual([]);
    expect(response.finalPayload).toEqual(payload);
  });

  it("removes missing columns and retries until success", async () => {
    const payload = {
      nombre: "Empresa A",
      codigo_origen_lead: "web",
      codigo_estado_pipeline: "lead",
    };

    let attempt = 0;

    const response = await safeInsertWithSchemaFallback({
      tableName: "empresas",
      payload,
      insertFn: async (currentPayload) => {
        attempt += 1;

        if (attempt === 1) {
          return {
            data: null,
            error: {
              message:
                "Could not find the 'codigo_origen_lead' column of 'empresas' in the schema cache",
            },
          };
        }

        if (attempt === 2) {
          return {
            data: null,
            error: {
              message:
                "Could not find the 'codigo_estado_pipeline' column of 'empresas' in the schema cache",
            },
          };
        }

        return {
          data: { id: "1", ...currentPayload },
          error: null,
        };
      },
    });

    expect(response.error).toBeNull();
    expect(response.attempts).toBe(3);
    expect(response.removedColumns).toEqual(["codigo_origen_lead", "codigo_estado_pipeline"]);
    expect(response.finalPayload).toEqual({ nombre: "Empresa A" });
  });

  it("returns first non-recoverable error", async () => {
    const payload = { nombre: "Empresa A" };

    const response = await safeInsertWithSchemaFallback({
      tableName: "empresas",
      payload,
      insertFn: async () => ({
        data: null,
        error: { message: "new row violates row-level security policy" },
      }),
    });

    expect(response.data).toBeNull();
    expect(response.error?.message).toContain("row-level security policy");
    expect(response.attempts).toBe(1);
    expect(response.removedColumns).toEqual([]);
  });

  it("keeps retrying beyond default maxAttempts when there are many removable columns", async () => {
    const payload = {
      nombre: "Empresa A",
      codigo_estado_pipeline: "lead",
      codigo_motivo_cierre: "",
      codigo_origen_lead: "web",
      codigo_postal: "38001",
      es_caso_exito: false,
    };

    const missingColumns = [
      "codigo_estado_pipeline",
      "codigo_motivo_cierre",
      "codigo_origen_lead",
      "codigo_postal",
      "es_caso_exito",
    ];

    let attempt = 0;

    const response = await safeInsertWithSchemaFallback({
      tableName: "empresas",
      payload,
      insertFn: async (currentPayload) => {
        attempt += 1;

        const missingColumn = missingColumns[attempt - 1];
        if (missingColumn) {
          return {
            data: null,
            error: {
              message: `Could not find the '${missingColumn}' column of 'empresas' in the schema cache`,
            },
          };
        }

        return {
          data: { id: "1", ...currentPayload },
          error: null,
        };
      },
    });

    expect(response.error).toBeNull();
    expect(response.attempts).toBe(6);
    expect(response.removedColumns).toEqual(missingColumns);
    expect(response.finalPayload).toEqual({ nombre: "Empresa A" });
  });
});
