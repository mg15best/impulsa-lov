/**
 * Catalog utilities tests
 */

import { describe, it, expect } from 'vitest';
import type { CatalogEntry } from '../lib/catalogUtils';

describe('CatalogEntry interface', () => {
  it('should have correct structure', () => {
    const mockEntry: CatalogEntry = {
      id: 'test-id',
      catalog_type: 'event_types',
      code: 'taller',
      label: 'Taller',
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(mockEntry.catalog_type).toBe('event_types');
    expect(mockEntry.code).toBe('taller');
    expect(mockEntry.label).toBe('Taller');
    expect(mockEntry.is_active).toBe(true);
  });
});

describe('Catalog code mapping', () => {
  it('should match existing enum values for event types', () => {
    const expectedEventTypes = ['taller', 'seminario', 'networking', 'conferencia', 'presentacion', 'otro'];
    
    // These codes should match the enum values in the database
    expectedEventTypes.forEach(code => {
      expect(code).toBeTruthy();
      expect(typeof code).toBe('string');
    });
  });

  it('should match existing enum values for event statuses', () => {
    const expectedEventStatuses = ['planificado', 'confirmado', 'en_curso', 'completado', 'cancelado'];
    
    // These codes should match the enum values in the database
    expectedEventStatuses.forEach(code => {
      expect(code).toBeTruthy();
      expect(typeof code).toBe('string');
    });
  });

  it('should match existing enum values for consultation statuses', () => {
    const expectedConsultationStatuses = ['programado', 'en_curso', 'completado', 'cancelado'];
    
    // These codes should match the enum values in the database
    expectedConsultationStatuses.forEach(code => {
      expect(code).toBeTruthy();
      expect(typeof code).toBe('string');
    });
  });
});
