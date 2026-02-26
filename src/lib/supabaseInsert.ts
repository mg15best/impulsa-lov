export type InsertErrorLike = {
  message: string;
};

export type InsertResult<TData, TError extends InsertErrorLike = InsertErrorLike> = {
  data: TData | null;
  error: TError | null;
};

export type SafeInsertOptions<
  TPayload extends Record<string, unknown>,
  TData,
  TError extends InsertErrorLike = InsertErrorLike,
> = {
  tableName: string;
  payload: TPayload;
  insertFn: (payload: Partial<TPayload>) => Promise<InsertResult<TData, TError>>;
  maxAttempts?: number;
};

export type SafeInsertResponse<
  TPayload extends Record<string, unknown>,
  TData,
  TError extends InsertErrorLike = InsertErrorLike,
> = {
  data: TData | null;
  error: TError | null;
  attempts: number;
  removedColumns: Array<keyof TPayload>;
  finalPayload: Partial<TPayload>;
};

export const getMissingColumnFromError = (errorMessage: string, tableName: string): string | null => {
  const escapedTable = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const missingColumnRegex = new RegExp(
    `Could not find the '([^']+)' column of '${escapedTable}'`,
    "i",
  );

  const missingColumn = errorMessage.match(missingColumnRegex)?.[1];
  return missingColumn ?? null;
};

export async function safeInsertWithSchemaFallback<
  TPayload extends Record<string, unknown>,
  TData,
  TError extends InsertErrorLike = InsertErrorLike,
>(options: SafeInsertOptions<TPayload, TData, TError>): Promise<
  SafeInsertResponse<TPayload, TData, TError>
> {
  const { tableName, payload, insertFn, maxAttempts = 5 } = options;
  let attemptsBudget = maxAttempts;
  const payloadWithFallback: Partial<TPayload> = { ...payload };
  const removedColumns: Array<keyof TPayload> = [];

  for (let attempt = 1; attempt <= attemptsBudget; attempt += 1) {
    const { data, error } = await insertFn(payloadWithFallback);

    if (!error) {
      return {
        data,
        error: null,
        attempts: attempt,
        removedColumns,
        finalPayload: payloadWithFallback,
      };
    }

    const missingColumn = getMissingColumnFromError(error.message, tableName);
    if (missingColumn && missingColumn in payloadWithFallback) {
      delete payloadWithFallback[missingColumn as keyof TPayload];
      removedColumns.push(missingColumn as keyof TPayload);
      attemptsBudget += 1;
      continue;
    }

    return {
      data: null,
      error,
      attempts: attempt,
      removedColumns,
      finalPayload: payloadWithFallback,
    };
  }

  return {
    data: null,
    error: {
      message: `Insert failed after ${attemptsBudget} attempts for table '${tableName}'.`,
    } as TError,
    attempts: attemptsBudget,
    removedColumns,
    finalPayload: payloadWithFallback,
  };
}
