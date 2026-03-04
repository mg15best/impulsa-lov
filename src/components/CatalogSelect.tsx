/**
 * CatalogSelect Component
 * 
 * A reusable select component for choosing values from a catalog.
 * Automatically fetches and displays catalog entries.
 */

import { useCatalog } from "@/hooks/useCatalog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type CustomOption = { code?: string; value?: string; label: string };

interface CatalogSelectProps {
  catalogType: string;
  value: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fallbackEntries?: Array<{ code: string; label: string }>;
  allowAll?: boolean;
  customOptions?: CustomOption[];
}

export function CatalogSelect({
  catalogType,
  value,
  onValueChange,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
  fallbackEntries = [],
  allowAll = false,
  customOptions,
}: CatalogSelectProps) {
  const handleChange = onValueChange ?? onChange ?? (() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`CatalogSelect (${catalogType}): no onChange or onValueChange handler provided`);
    }
  });
  const { data: entries, isLoading, error } = useCatalog(catalogType);

  const normalizedCustomOptions = customOptions?.map((opt) => {
    const code = opt.code ?? opt.value ?? "";
    if (!code && process.env.NODE_ENV !== 'production') {
      console.warn(`CatalogSelect (${catalogType}): customOption missing code/value`, opt);
    }
    return { code, label: opt.label };
  });

  const resolvedEntries = normalizedCustomOptions
    ? normalizedCustomOptions
    : entries && entries.length > 0
    ? entries
    : fallbackEntries;

  if (isLoading && !customOptions) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error && !customOptions) {
    console.error(`Error loading catalog ${catalogType}:`, error);
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Error cargando catálogo" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && (
          <SelectItem value="all">{placeholder}</SelectItem>
        )}
        {resolvedEntries.map((entry) => (
          <SelectItem key={entry.code} value={entry.code}>
            {entry.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
