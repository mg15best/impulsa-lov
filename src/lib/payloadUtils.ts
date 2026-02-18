export const normalizeOptionalString = (value: string | null | undefined): string | null => {
  if (value == null) return null;

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

export const normalizeOptionalDate = (value: string | null | undefined): string | null => {
  return normalizeOptionalString(value);
};

export const normalizeOptionalNumber = (
  value: number | string | null | undefined,
): number | null => {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const parsed = Number(trimmedValue);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return Number.isFinite(value) ? value : null;
};
