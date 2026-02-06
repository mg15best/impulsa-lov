# Documentación Fundacional: Mapeo y Decisiones de Modelo

## PR-A: Integración del Nuevo Esquema

Este conjunto de documentos establece las bases para la migración del esquema actual (en español) al nuevo esquema propuesto (en inglés) del sistema Impulsa LOV.

## Documentos Incluidos

### 1. [Mapeo de Entidades](./MAPEO_ENTIDADES.md)
**Propósito**: Documentar el mapeo completo entre entidades actuales y propuestas

**Contenido**:
- Tabla de mapeo de todas las entidades (empresas → companies, contactos → company_contacts, etc.)
- Decisiones detalladas por entidad: renombrar, consolidar o mantener
- Mapeo de campos clave con nomenclatura EN/ES
- Relaciones entre entidades y cómo se traducen al nuevo esquema
- Patrones comunes de renombrado de campos

**Decisiones Principales**:
- 8 entidades renombradas con nomenclatura inglesa
- 1 entidad mantenida (user_roles, ya en inglés)
- 0 entidades consolidadas o descartadas
- Todas las entidades actuales se preservan en el nuevo esquema

---

### 2. [Decisiones sobre Duplicidades Conceptuales](./DECISIONES_DUPLICIDADES.md)
**Propósito**: Resolver ambigüedades y duplicidades conceptuales identificadas

**Contenido**:
- Análisis de 7 casos potenciales de duplicidad
- Decisiones fundamentadas para cada caso
- Matriz de comparación
- Convenciones de nomenclatura establecidas
- Recomendaciones de implementación

**Casos Analizados**:
1. **Colaboradores vs. Empresas**: MANTENER SEPARADOS (roles diferentes)
2. **Evidencias vs. Attachments**: RENOMBRAR a Attachments (mayor universalidad)
3. **Contactos vs. Contact Details**: SEPARADOS (entidad vs. atributos)
4. **Usuarios vs. Profiles vs. Técnicos**: MANTENER ARQUITECTURA ACTUAL
5. **Estado en múltiples entidades**: ENUMs ESPECÍFICOS por contexto
6. **Tipo en múltiples entidades**: ENUMs ESPECÍFICOS por contexto
7. **Fechas (created_at vs. fecha)**: CONVENCIONES CLARAS (auditoría vs. negocio)

**Conclusión**: No existen duplicidades reales; todas son diferenciaciones legítimas con propósitos distintos.

---

### 3. [Glosario EN→ES para UI](./GLOSARIO_UI.md)
**Propósito**: Mapear términos del código (inglés) a etiquetas de UI (español)

**Contenido**:
- Glosario completo por entidad (9 entidades documentadas)
- Más de 200 campos documentados con sus traducciones
- Campos comunes (fechas, contacto, archivos, etc.)
- Estados y tipos (40+ valores enumerados)
- Acciones de UI (CRUD y botones)
- Mensajes del sistema (éxito, error, confirmación, info)
- Placeholders y textos de ayuda

**Alcance**:
- Companies (Empresas): 35+ campos
- Company Contacts (Contactos): 12 campos
- Consultations (Asesoramientos): 14 campos
- Events (Eventos): 16 campos
- Trainings (Formaciones): 18 campos
- Attachments (Evidencias): 14 campos
- Partner Entities (Colaboradores): 25+ campos
- User Profiles: 6 campos
- User Roles: 4 campos

**Uso**: Permite mantener el código en inglés mientras la UI se presenta completamente en español.

---

### 4. [Inventario de Catálogos](./INVENTARIO_CATALOGOS.md)
**Propósito**: Definir todos los catálogos necesarios para valores controlados

**Contenido**:
- 22 catálogos identificados y documentados
- Estructura de cada catálogo (code, label ES/EN, descripción, orden)
- Valores propuestos para cada catálogo
- Campos que referencian cada catálogo
- Priorización (Alta/Media/Baja)

**Catálogos de Alta Prioridad** (11):
1. company_sectors (9+ valores)
2. maturity_phases (4 valores)
3. company_statuses (4 valores)
4. consultation_statuses (4 valores)
5. event_types (6 valores)
6. event_statuses (5 valores)
7. training_types (5 valores)
8. training_statuses (4 valores)
9. attachment_types (7 valores)
10. partner_types (6 valores)
11. user_roles (2+ valores)

**Catálogos de Prioridad Media** (9):
- pipeline_statuses, lead_sources, legal_forms, closure_reasons
- training_modalities, partner_statuses, partnership_scopes, support_types
- canary_islands

**Catálogos de Prioridad Baja** (2):
- ticket_ranges, municipalities

**Implementación Técnica**:
- Propuesta de tabla unificada `catalogs`
- Estructura de datos recomendada
- Scripts de población inicial
- Componentes de UI (CatalogSelect)
- Sistema de caché y validación

---

## Estructura de la Migración

### Fase 1: Preparación (Actual - Documentación)
✅ **Documentar** mapeo de entidades  
✅ **Decidir** sobre duplicidades conceptuales  
✅ **Definir** glosario EN→ES  
✅ **Inventariar** catálogos necesarios  

### Fase 2: Implementación de Catálogos
- Crear tabla `catalogs` unificada
- Poblar catálogos iniciales
- Crear componentes UI para selectores
- Implementar validaciones

### Fase 3: Migración de Schema
- Crear nuevas tablas con nomenclatura inglesa
- Mantener tablas antiguas temporalmente
- Script de migración de datos
- Validación de integridad

### Fase 4: Actualización de Código
- Actualizar TypeScript types
- Actualizar consultas y mutations
- Actualizar componentes UI
- Implementar sistema i18n

### Fase 5: Transición y Limpieza
- Crear vistas con nombres antiguos (compatibilidad)
- Período de convivencia
- Eliminar código legacy
- Actualizar documentación final

## Convenciones Establecidas

### Nomenclatura de Tablas
- **Formato**: Plural en inglés, snake_case
- **Ejemplos**: `companies`, `company_contacts`, `partner_entities`

### Nomenclatura de Campos
- **Formato**: Snake_case en inglés
- **IDs**: Siempre termina en `_id` (ej: `company_id`)
- **Fechas de negocio**: Terminan en `_date` (ej: `start_date`)
- **Timestamps**: Terminan en `_at` (ej: `created_at`)
- **Códigos**: Terminan en `_code` (ej: `sector_code`)
- **URLs**: Terminan en `_url` (ej: `file_url`)
- **Booleanos**: Prefijo `is_` (ej: `is_active`)

### Tipos de Datos
| Concepto | PostgreSQL | TypeScript |
|----------|-----------|------------|
| IDs | UUID | string |
| Texto | TEXT | string |
| Fechas | DATE | string (ISO) |
| Timestamps | TIMESTAMP WITH TIME ZONE | string (ISO) |
| Booleanos | BOOLEAN | boolean |
| Enteros | INTEGER | number |
| Arrays | TEXT[] | string[] |
| JSON | JSONB | object |

### Foreign Keys
- **CASCADE**: Para relaciones dependientes fuertes (contactos de empresa)
- **SET NULL**: Para relaciones opcionales (técnico asignado)
- **RESTRICT**: Para prevenir eliminaciones accidentales

## Impacto Estimado

### Base de Datos
- **Tablas afectadas**: 9 tablas principales
- **Campos renombrados**: ~150 campos
- **Nuevos catálogos**: 1 tabla nueva con 22 tipos
- **Migración de datos**: Script automatizado necesario

### Frontend
- **Archivos TypeScript**: ~50 archivos a actualizar
- **Componentes**: ~30 componentes afectados
- **Sistema i18n**: Implementación nueva
- **Nuevos componentes**: Selectores de catálogos, gestión de catálogos

### API
- **Endpoints**: Todos los endpoints cambiarán de nombre
- **Compatibilidad**: Vistas temporales para transición
- **Versionado**: Considerar API v2 para nueva nomenclatura

## Métricas de Calidad

### Completitud de Documentación
✅ **100%** de entidades documentadas (9/9)  
✅ **100%** de campos clave mapeados  
✅ **100%** de catálogos inventariados (22/22)  
✅ **7** casos de duplicidad analizados y resueltos  

### Claridad
✅ Nomenclatura consistente establecida  
✅ Convenciones claras definidas  
✅ Ejemplos proporcionados  
✅ Diagramas de relaciones actualizados  

### Utilidad
✅ Glosario completo para traducción  
✅ Scripts de implementación incluidos  
✅ Componentes de ejemplo proporcionados  
✅ Plan de migración por fases  

## Próximos Pasos

### Inmediatos (Semana 1-2)
1. **Revisar y aprobar** documentación con stakeholders
2. **Priorizar** catálogos a implementar primero
3. **Crear épica** de migración en sistema de gestión
4. **Planificar sprints** para cada fase

### Corto Plazo (Mes 1)
1. **Implementar** tabla de catálogos
2. **Poblar** catálogos de alta prioridad
3. **Crear** componentes UI base
4. **Desarrollar** scripts de migración

### Medio Plazo (Meses 2-3)
1. **Migrar** esquema de base de datos
2. **Actualizar** código frontend
3. **Implementar** sistema i18n
4. **Testing** exhaustivo

### Largo Plazo (Meses 4-6)
1. **Desplegar** a producción por fases
2. **Monitorear** y ajustar
3. **Eliminar** código legacy
4. **Documentar** lecciones aprendidas

## Contacto y Soporte

Para preguntas o aclaraciones sobre esta documentación:

- **Documentación técnica**: Ver archivos individuales en `/docs`
- **Issues**: Reportar en el repositorio
- **Cambios**: Proponer vía Pull Request

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-02-06 | Documentación inicial completa |

---

**Autor**: Equipo de Desarrollo Impulsa LOV  
**Estado**: ✅ Completo y listo para revisión  
**Próxima revisión**: Pendiente de aprobación de stakeholders
