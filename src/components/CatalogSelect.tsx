/**
 * CatalogSelect Component
 * 
 * A reusable select component for choosing values from a catalog.
 * Automatically fetches and displays catalog entries.
 */

import { useCatalog } from "@/hooks/useCatalog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface CatalogSelectProps {
  catalogType: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fallbackEntries?: Array<{ code: string; label: string }>;
}

export function CatalogSelect({
  catalogType,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
  fallbackEntries = [],
}: CatalogSelectProps) {
  const { data: entries, isLoading, error } = useCatalog(catalogType);
  const resolvedEntries = entries && entries.length > 0 ? entries : fallbackEntries;

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
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
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {resolvedEntries.map((entry) => (
          <SelectItem key={entry.code} value={entry.code}>
            {entry.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
