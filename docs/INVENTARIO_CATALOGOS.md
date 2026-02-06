# Inventario de Catálogos

## Índice
1. [Introducción](#introducción)
2. [Resumen de Catálogos](#resumen-de-catálogos)
3. [Catálogos por Tipo](#catálogos-por-tipo)
4. [Estructura de Catálogos](#estructura-de-catálogos)
5. [Implementación Técnica](#implementación-técnica)
6. [Mantenimiento y Extensibilidad](#mantenimiento-y-extensibilidad)

## Introducción

Este documento presenta un inventario completo de todos los catálogos necesarios para el sistema Impulsa LOV. Los catálogos son listas controladas de valores que se utilizan para estandarizar datos, facilitar búsquedas y reportes, y mejorar la experiencia del usuario mediante selectores predefinidos.

### Definición de Catálogo

Un catálogo en este contexto es:
- Una tabla de referencia con valores predefinidos
- Identificado por un `catalog_type` único
- Cada entrada tiene un `code` (identificador interno) y un `label` (etiqueta visible)
- Puede incluir campos adicionales como descripción, orden, estado activo/inactivo, etc.

### Beneficios de los Catálogos

1. **Consistencia de datos**: Evita entradas inconsistentes o con errores tipográficos
2. **Facilidad de búsqueda**: Permite filtros y búsquedas exactas
3. **Reportes precisos**: Facilita agrupaciones y estadísticas
4. **Experiencia de usuario**: Selectores en lugar de campos de texto libre
5. **Multiidioma**: Permite traducciones fáciles cambiando solo las etiquetas
6. **Mantenibilidad**: Centraliza la gestión de valores de dominio

## Resumen de Catálogos

| # | Catalog Type | Descripción | Cantidad de Valores | Prioridad |
|---|--------------|-------------|---------------------|-----------|
| 1 | `company_sectors` | Sectores económicos de empresas | 9+ | Alta |
| 2 | `maturity_phases` | Fases de madurez empresarial | 4 | Alta |
| 3 | `company_statuses` | Estados del proceso de asesoramiento | 4 | Alta |
| 4 | `pipeline_statuses` | Estados en el pipeline de ventas | 6-10 | Media |
| 5 | `lead_sources` | Orígenes de leads | 8-12 | Media |
| 6 | `legal_forms` | Formas jurídicas | 10-15 | Media |
| 7 | `closure_reasons` | Motivos de cierre de casos | 8-12 | Media |
| 8 | `consultation_statuses` | Estados de asesoramientos | 4 | Alta |
| 9 | `event_types` | Tipos de eventos | 6 | Alta |
| 10 | `event_statuses` | Estados de eventos | 5 | Alta |
| 11 | `training_types` | Tipos de formaciones | 5 | Alta |
| 12 | `training_statuses` | Estados de formaciones | 4 | Alta |
| 13 | `training_modalities` | Modalidades de formación | 3 | Media |
| 14 | `attachment_types` | Tipos de evidencias/adjuntos | 7 | Alta |
| 15 | `partner_types` | Tipos de colaboradores | 6 | Alta |
| 16 | `partner_statuses` | Estados de colaboradores | 3 | Media |
| 17 | `partnership_scopes` | Alcances de colaboración | 4 | Media |
| 18 | `support_types` | Tipos de apoyo ofrecido | 6-10 | Media |
| 19 | `ticket_ranges` | Rangos de inversión/ticket | 5-7 | Baja |
| 20 | `user_roles` | Roles de usuario | 2+ | Alta |
| 21 | `canary_islands` | Islas Canarias | 8 | Media |
| 22 | `municipalities` | Municipios (por isla) | 88 | Baja |

## Catálogos por Tipo

### 1. Company Sectors (Sectores de Empresa)

**Catalog Type**: `company_sectors`

**Propósito**: Clasificar empresas por sector económico principal

**Campo Relacionado**: `companies.sector_code`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `tech` | Tecnología | Technology | Empresas de tecnología, software, IT | 1 |
| `industry` | Industria | Industry | Industria manufacturera | 2 |
| `services` | Servicios | Services | Servicios profesionales, consultoría | 3 |
| `commerce` | Comercio | Commerce | Comercio minorista, mayorista | 4 |
| `tourism` | Turismo | Tourism | Turismo, hostelería, restauración | 5 |
| `energy` | Energía | Energy | Energía, renovables | 6 |
| `construction` | Construcción | Construction | Construcción, inmobiliaria | 7 |
| `agrifood` | Agroalimentario | Agrifood | Agricultura, ganadería, alimentación | 8 |
| `health` | Salud | Health | Salud, farmacéutica, biotecnología | 9 |
| `education` | Educación | Education | Educación, formación | 10 |
| `culture` | Cultura | Culture | Cultura, entretenimiento, medios | 11 |
| `other` | Otro | Other | Otros sectores | 99 |

**Notas**:
- El sector actual es un ENUM en la base de datos
- Migrar a catálogo permite añadir nuevos sectores sin cambiar el schema
- Incluir subsectores como catálogo opcional

---

### 2. Maturity Phases (Fases de Madurez)

**Catalog Type**: `maturity_phases`

**Propósito**: Clasificar empresas según su fase de desarrollo

**Campo Relacionado**: `companies.maturity_phase`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `idea` | Idea | Idea | Fase inicial, conceptualización | 1 |
| `validation` | Validación | Validation | Validando el modelo de negocio | 2 |
| `growth` | Crecimiento | Growth | En crecimiento activo | 3 |
| `consolidation` | Consolidación | Consolidation | Empresa consolidada | 4 |

---

### 3. Company Statuses (Estados de Empresa)

**Catalog Type**: `company_statuses`

**Propósito**: Seguimiento del progreso en el proceso de asesoramiento

**Campo Relacionado**: `companies.status`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `pending` | Pendiente | Pending | Pendiente de iniciar | 1 |
| `in_progress` | En Proceso | In Progress | Asesoramiento en curso | 2 |
| `advised` | Asesorada | Advised | Asesoramiento completado | 3 |
| `completed` | Completada | Completed | Caso completado y cerrado | 4 |

---

### 4. Pipeline Statuses (Estados en Pipeline)

**Catalog Type**: `pipeline_statuses`

**Propósito**: Gestión de ventas y captación de leads

**Campo Relacionado**: `companies.pipeline_status_code`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `new_lead` | Nuevo Lead | New Lead | Lead recién capturado | 1 |
| `contacted` | Contactado | Contacted | Primer contacto realizado | 2 |
| `qualified` | Cualificado | Qualified | Lead cualificado | 3 |
| `proposal_sent` | Propuesta Enviada | Proposal Sent | Propuesta de asesoramiento enviada | 4 |
| `negotiation` | Negociación | Negotiation | En negociación | 5 |
| `accepted` | Aceptado | Accepted | Propuesta aceptada | 6 |
| `lost` | Perdido | Lost | Oportunidad perdida | 7 |
| `on_hold` | En Espera | On Hold | Temporalmente en pausa | 8 |

**Notas**:
- Puede variar según el proceso de ventas específico
- Considerar integración con CRM

---

### 5. Lead Sources (Orígenes de Leads)

**Catalog Type**: `lead_sources`

**Propósito**: Rastrear de dónde provienen los contactos

**Campo Relacionado**: `companies.lead_source_code`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `web_form` | Formulario Web | Web Form | Formulario en sitio web | 1 |
| `referral` | Referencia | Referral | Referido por tercero | 2 |
| `event` | Evento | Event | Conocido en evento | 3 |
| `social_media` | Redes Sociales | Social Media | Redes sociales | 4 |
| `email_campaign` | Campaña Email | Email Campaign | Campaña de email marketing | 5 |
| `phone_call` | Llamada | Phone Call | Contacto telefónico | 6 |
| `partner` | Colaborador | Partner | Referido por colaborador | 7 |
| `direct` | Directo | Direct | Contacto directo | 8 |
| `other` | Otro | Other | Otra fuente | 99 |

---

### 6. Legal Forms (Formas Jurídicas)

**Catalog Type**: `legal_forms`

**Propósito**: Clasificar empresas por su estructura legal

**Campo Relacionado**: `companies.legal_form`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `sl` | S.L. (Sociedad Limitada) | Limited Company | Sociedad de responsabilidad limitada | 1 |
| `sa` | S.A. (Sociedad Anónima) | Corporation | Sociedad anónima | 2 |
| `autonomo` | Autónomo | Self-Employed | Trabajador autónomo | 3 |
| `cooperativa` | Cooperativa | Cooperative | Sociedad cooperativa | 4 |
| `asociacion` | Asociación | Association | Asociación sin ánimo de lucro | 5 |
| `fundacion` | Fundación | Foundation | Fundación | 6 |
| `slne` | S.L.N.E. (Nueva Empresa) | New Limited Company | Sociedad limitada nueva empresa | 7 |
| `comunidad_bienes` | Comunidad de Bienes | Community of Goods | Comunidad de bienes | 8 |
| `sociedad_civil` | Sociedad Civil | Civil Partnership | Sociedad civil | 9 |
| `slp` | S.L.P. (Laboral) | Worker-owned Limited | Sociedad limitada laboral | 10 |
| `other` | Otra | Other | Otra forma jurídica | 99 |

---

### 7. Closure Reasons (Motivos de Cierre)

**Catalog Type**: `closure_reasons`

**Propósito**: Registrar por qué se cierra un caso

**Campo Relacionado**: `companies.closure_reason_code`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `success` | Éxito Completado | Successfully Completed | Caso completado con éxito | 1 |
| `objectives_met` | Objetivos Alcanzados | Objectives Met | Objetivos del asesoramiento cumplidos | 2 |
| `no_interest` | Sin Interés | No Interest | Empresa perdió interés | 3 |
| `no_response` | Sin Respuesta | No Response | Empresa dejó de responder | 4 |
| `not_qualified` | No Cualificado | Not Qualified | No cumple criterios | 5 |
| `business_closed` | Negocio Cerrado | Business Closed | Empresa cerró operaciones | 6 |
| `duplicate` | Duplicado | Duplicate | Caso duplicado | 7 |
| `budget_constraints` | Restricciones Presupuestarias | Budget Constraints | Problemas de presupuesto | 8 |
| `timing_issues` | Problemas de Timing | Timing Issues | No es el momento adecuado | 9 |
| `other` | Otro | Other | Otro motivo | 99 |

---

### 8. Consultation Statuses (Estados de Asesoramiento)

**Catalog Type**: `consultation_statuses`

**Propósito**: Estado de sesiones de asesoramiento

**Campo Relacionado**: `consultations.status`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `scheduled` | Programado | Scheduled | Sesión programada | 1 |
| `in_progress` | En Curso | In Progress | Sesión en curso | 2 |
| `completed` | Completado | Completed | Sesión completada | 3 |
| `cancelled` | Cancelado | Cancelled | Sesión cancelada | 4 |
| `rescheduled` | Reprogramado | Rescheduled | Sesión reprogramada | 5 |

---

### 9. Event Types (Tipos de Eventos)

**Catalog Type**: `event_types`

**Propósito**: Clasificar eventos por tipo

**Campo Relacionado**: `events.type`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `workshop` | Taller | Workshop | Taller práctico | 1 |
| `seminar` | Seminario | Seminar | Seminario informativo | 2 |
| `networking` | Networking | Networking | Evento de networking | 3 |
| `conference` | Conferencia | Conference | Conferencia | 4 |
| `presentation` | Presentación | Presentation | Presentación o pitch | 5 |
| `roundtable` | Mesa Redonda | Roundtable | Mesa redonda de discusión | 6 |
| `other` | Otro | Other | Otro tipo de evento | 99 |

---

### 10. Event Statuses (Estados de Eventos)

**Catalog Type**: `event_statuses`

**Propósito**: Estado de organización de eventos

**Campo Relacionado**: `events.status`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `planned` | Planificado | Planned | Evento planificado | 1 |
| `confirmed` | Confirmado | Confirmed | Evento confirmado | 2 |
| `in_progress` | En Curso | In Progress | Evento en curso | 3 |
| `completed` | Completado | Completed | Evento completado | 4 |
| `cancelled` | Cancelado | Cancelled | Evento cancelado | 5 |

---

### 11. Training Types (Tipos de Formación)

**Catalog Type**: `training_types`

**Propósito**: Clasificar formaciones por tipo

**Campo Relacionado**: `trainings.type`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `training_pill` | Píldora Formativa | Training Pill | Formación corta y específica | 1 |
| `course` | Curso | Course | Curso completo | 2 |
| `masterclass` | Masterclass | Masterclass | Masterclass especializada | 3 |
| `webinar` | Webinar | Webinar | Seminario online | 4 |
| `workshop` | Taller | Workshop | Taller práctico | 5 |
| `other` | Otro | Other | Otro tipo de formación | 99 |

---

### 12. Training Statuses (Estados de Formación)

**Catalog Type**: `training_statuses`

**Propósito**: Estado de formaciones

**Campo Relacionado**: `trainings.status`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `planned` | Planificada | Planned | Formación planificada | 1 |
| `in_progress` | En Curso | In Progress | Formación en curso | 2 |
| `completed` | Completada | Completed | Formación completada | 3 |
| `cancelled` | Cancelada | Cancelled | Formación cancelada | 4 |

---

### 13. Training Modalities (Modalidades de Formación)

**Catalog Type**: `training_modalities`

**Propósito**: Modalidad de impartición de formaciones

**Campo Relacionado**: `trainings.modality`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `in_person` | Presencial | In Person | Formación presencial | 1 |
| `online` | Online | Online | Formación online | 2 |
| `hybrid` | Híbrida | Hybrid | Formación híbrida | 3 |

---

### 14. Attachment Types (Tipos de Evidencias)

**Catalog Type**: `attachment_types`

**Propósito**: Clasificar adjuntos/evidencias por tipo

**Campo Relacionado**: `attachments.type`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `report` | Informe | Report | Informe o reporte | 1 |
| `minutes` | Acta | Minutes | Acta de reunión | 2 |
| `photo` | Fotografía | Photo | Fotografía | 3 |
| `video` | Video | Video | Video | 4 |
| `certificate` | Certificado | Certificate | Certificado | 5 |
| `document` | Documento | Document | Documento general | 6 |
| `presentation` | Presentación | Presentation | Presentación (PPT, etc.) | 7 |
| `other` | Otro | Other | Otro tipo | 99 |

---

### 15. Partner Types (Tipos de Colaborador)

**Catalog Type**: `partner_types`

**Propósito**: Clasificar colaboradores por tipo de organización

**Campo Relacionado**: `partner_entities.type`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `public_entity` | Entidad Pública | Public Entity | Organismo público | 1 |
| `private_entity` | Entidad Privada | Private Entity | Empresa privada | 2 |
| `association` | Asociación | Association | Asociación | 3 |
| `university` | Universidad | University | Universidad | 4 |
| `research_center` | Centro de Investigación | Research Center | Centro de I+D | 5 |
| `ngo` | ONG | NGO | Organización no gubernamental | 6 |
| `other` | Otro | Other | Otro tipo | 99 |

---

### 16. Partner Statuses (Estados de Colaborador)

**Catalog Type**: `partner_statuses`

**Propósito**: Estado de la relación con colaboradores

**Campo Relacionado**: `partner_entities.status`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `active` | Activo | Active | Colaboración activa | 1 |
| `inactive` | Inactivo | Inactive | Colaboración inactiva | 2 |
| `pending` | Pendiente | Pending | Pendiente de activar | 3 |

---

### 17. Partnership Scopes (Alcances de Colaboración)

**Catalog Type**: `partnership_scopes`

**Propósito**: Alcance geográfico de colaboraciones

**Campo Relacionado**: `partner_entities.scope_code`

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `local` | Local | Local | Ámbito local/municipal | 1 |
| `regional` | Regional | Regional | Ámbito regional/autonómico | 2 |
| `national` | Nacional | National | Ámbito nacional | 3 |
| `international` | Internacional | International | Ámbito internacional | 4 |

---

### 18. Support Types (Tipos de Apoyo)

**Catalog Type**: `support_types`

**Propósito**: Tipos de apoyo que ofrecen colaboradores

**Campo Relacionado**: `partner_entities.support_types` (array)

| Code | Label ES | Label EN | Descripción | Orden |
|------|----------|----------|-------------|-------|
| `financial` | Financiero | Financial | Apoyo financiero, préstamos | 1 |
| `technical` | Técnico | Technical | Asistencia técnica | 2 |
| `training` | Formativo | Training | Formación y capacitación | 3 |
| `mentoring` | Mentoría | Mentoring | Mentoría y coaching | 4 |
| `networking` | Networking | Networking | Conexiones y red de contactos | 5 |
| `infrastructure` | Infraestructura | Infrastructure | Espacios, equipos | 6 |
| `legal` | Legal | Legal | Asesoría legal | 7 |
| `marketing` | Marketing | Marketing | Apoyo en marketing | 8 |
| `other` | Otro | Other | Otro tipo de apoyo | 99 |

**Nota**: Este es un campo de array, puede tener múltiples valores

---

### 19. Ticket Ranges (Rangos de Inversión)

**Catalog Type**: `ticket_ranges`

**Propósito**: Rangos de inversión/ticket de colaboradores

**Campo Relacionado**: `partner_entities.ticket_range_code`

| Code | Label ES | Label EN | Descripción (€) | Orden |
|------|----------|----------|-----------------|-------|
| `micro` | Micro | Micro | < 10.000 € | 1 |
| `small` | Pequeño | Small | 10.000 - 50.000 € | 2 |
| `medium` | Medio | Medium | 50.000 - 200.000 € | 3 |
| `large` | Grande | Large | 200.000 - 500.000 € | 4 |
| `very_large` | Muy Grande | Very Large | > 500.000 € | 5 |
| `not_applicable` | No Aplica | Not Applicable | No aplica | 99 |

**Nota**: Los rangos pueden ajustarse según el contexto del programa

---

### 20. User Roles (Roles de Usuario)

**Catalog Type**: `user_roles`

**Propósito**: Roles para control de acceso

**Campo Relacionado**: `user_roles.role`

| Code | Label ES | Label EN | Descripción | Permisos | Orden |
|------|----------|----------|-------------|----------|-------|
| `admin` | Administrador | Administrator | Acceso completo al sistema | Full | 1 |
| `technician` | Técnico | Technician | Técnico de asesoramiento | Limited | 2 |
| `viewer` | Observador | Viewer | Solo lectura | Read-only | 3 |

**Nota**: Actualmente solo existen admin y tecnico como ENUM

---

### 21. Canary Islands (Islas Canarias)

**Catalog Type**: `canary_islands`

**Propósito**: Islas Canarias para localización

**Campo Relacionado**: `companies.island`, `events.location` (parsing)

| Code | Label ES | Label EN | Provincia | Orden |
|------|----------|----------|-----------|-------|
| `tenerife` | Tenerife | Tenerife | Santa Cruz de Tenerife | 1 |
| `gran_canaria` | Gran Canaria | Gran Canaria | Las Palmas | 2 |
| `lanzarote` | Lanzarote | Lanzarote | Las Palmas | 3 |
| `fuerteventura` | Fuerteventura | Fuerteventura | Las Palmas | 4 |
| `la_palma` | La Palma | La Palma | Santa Cruz de Tenerife | 5 |
| `la_gomera` | La Gomera | La Gomera | Santa Cruz de Tenerife | 6 |
| `el_hierro` | El Hierro | El Hierro | Santa Cruz de Tenerife | 7 |
| `la_graciosa` | La Graciosa | La Graciosa | Las Palmas | 8 |

---

### 22. Municipalities (Municipios)

**Catalog Type**: `municipalities`

**Propósito**: Municipios de Canarias

**Campo Relacionado**: `companies.municipality`

**Estructura**:
- Total: 88 municipios
- Agrupados por isla
- Incluye nombre, código postal, isla

**Ejemplo** (Tenerife, parcial):

| Code | Label ES | Island | Postal Codes | Orden |
|------|----------|--------|--------------|-------|
| `santa_cruz` | Santa Cruz de Tenerife | Tenerife | 38001-38010 | 1 |
| `la_laguna` | San Cristóbal de La Laguna | Tenerife | 38200-38207 | 2 |
| `arona` | Arona | Tenerife | 38640-38650 | 3 |
| `adeje` | Adeje | Tenerife | 38670-38679 | 4 |
| ... | ... | ... | ... | ... |

**Nota**: Lista completa disponible en archivo separado por su extensión

---

## Estructura de Catálogos

### Opción 1: Tabla Unificada (Recomendada)

```sql
CREATE TABLE public.catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (catalog_type, code)
);

CREATE INDEX idx_catalogs_type ON catalogs(catalog_type);
CREATE INDEX idx_catalogs_active ON catalogs(is_active) WHERE is_active = true;
```

**Ventajas**:
- Estructura centralizada y uniforme
- Fácil de gestionar desde un panel de administración
- Queries simples: `SELECT * FROM catalogs WHERE catalog_type = 'company_sectors'`
- Añadir nuevos catálogos sin cambiar el schema

**Ejemplo de datos**:
```sql
INSERT INTO catalogs (catalog_type, code, label_es, label_en, display_order) VALUES
('company_sectors', 'tech', 'Tecnología', 'Technology', 1),
('company_sectors', 'industry', 'Industria', 'Industry', 2),
('maturity_phases', 'idea', 'Idea', 'Idea', 1),
('maturity_phases', 'validation', 'Validación', 'Validation', 2);
```

### Opción 2: Tablas Individuales

```sql
CREATE TABLE public.catalog_company_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.catalog_maturity_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ... una tabla por cada catálogo
```

**Ventajas**:
- Tipos más específicos
- Constraints específicos por catálogo
- Puede incluir campos adicionales únicos

**Desventajas**:
- Múltiples tablas a gestionar
- Cambios en schema para nuevos catálogos
- Panel de admin más complejo

### Opción 3: ENUM Types (Actual)

```sql
CREATE TYPE public.sector_empresa AS ENUM (
  'tecnologia',
  'industria',
  'servicios',
  ...
);
```

**Ventajas**:
- Validación a nivel de base de datos
- Performance óptimo

**Desventajas**:
- Difícil de modificar (requiere migrations)
- No soporta traducciones
- No permite activar/desactivar valores

### Recomendación: Migración Gradual

1. **Fase 1**: Mantener ENUMs existentes
2. **Fase 2**: Crear tabla `catalogs` unificada
3. **Fase 3**: Poblar catálogos desde ENUMs
4. **Fase 4**: Cambiar campos de ENUM a TEXT con FK a catalogs
5. **Fase 5**: Eliminar ENUMs cuando sea seguro

## Implementación Técnica

### Backend (Supabase)

```sql
-- Migración: Crear tabla de catálogos
CREATE TABLE public.catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  parent_code TEXT, -- Para catálogos jerárquicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (catalog_type, code)
);

-- Índices
CREATE INDEX idx_catalogs_type ON catalogs(catalog_type);
CREATE INDEX idx_catalogs_active ON catalogs(catalog_type, is_active) WHERE is_active = true;
CREATE INDEX idx_catalogs_order ON catalogs(catalog_type, display_order);

-- RLS
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer catálogos activos
CREATE POLICY "Catalogs are viewable by all users" ON catalogs
  FOR SELECT
  USING (is_active = true);

-- Política: Solo admins pueden modificar catálogos
CREATE POLICY "Catalogs are editable by admins" ON catalogs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_catalogs_updated_at
  BEFORE UPDATE ON catalogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Frontend (TypeScript)

```typescript
// types/catalog.ts
export interface CatalogEntry {
  id: string;
  catalog_type: string;
  code: string;
  label_es: string;
  label_en?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
}

// hooks/useCatalog.ts
export function useCatalog(catalogType: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog', catalogType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('catalog_type', catalogType)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CatalogEntry[];
    },
  });

  return { data, isLoading, error };
}

// components/CatalogSelect.tsx
interface CatalogSelectProps {
  catalogType: string;
  value: string;
  onChange: (value: string) => void;
  language?: 'es' | 'en';
}

export function CatalogSelect({ 
  catalogType, 
  value, 
  onChange,
  language = 'es' 
}: CatalogSelectProps) {
  const { data: options, isLoading } = useCatalog(catalogType);

  if (isLoading) return <Skeleton />;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            {language === 'es' ? option.label_es : option.label_en || option.label_es}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Uso en formularios
<CatalogSelect
  catalogType="company_sectors"
  value={formData.sector_code}
  onChange={(value) => setFormData({ ...formData, sector_code: value })}
/>
```

### Script de Población Inicial

```sql
-- scripts/seed_catalogs.sql

-- Company Sectors
INSERT INTO catalogs (catalog_type, code, label_es, label_en, display_order) VALUES
('company_sectors', 'tech', 'Tecnología', 'Technology', 1),
('company_sectors', 'industry', 'Industria', 'Industry', 2),
('company_sectors', 'services', 'Servicios', 'Services', 3),
('company_sectors', 'commerce', 'Comercio', 'Commerce', 4),
('company_sectors', 'tourism', 'Turismo', 'Tourism', 5),
('company_sectors', 'energy', 'Energía', 'Energy', 6),
('company_sectors', 'construction', 'Construcción', 'Construction', 7),
('company_sectors', 'agrifood', 'Agroalimentario', 'Agrifood', 8),
('company_sectors', 'other', 'Otro', 'Other', 99);

-- Maturity Phases
INSERT INTO catalogs (catalog_type, code, label_es, label_en, display_order) VALUES
('maturity_phases', 'idea', 'Idea', 'Idea', 1),
('maturity_phases', 'validation', 'Validación', 'Validation', 2),
('maturity_phases', 'growth', 'Crecimiento', 'Growth', 3),
('maturity_phases', 'consolidation', 'Consolidación', 'Consolidation', 4);

-- ... continuar con todos los catálogos
```

## Mantenimiento y Extensibilidad

### Panel de Administración

Crear un panel de administración para gestionar catálogos:

**Funcionalidades**:
1. Listar todos los tipos de catálogo
2. Ver/editar entradas de cada catálogo
3. Añadir nuevas entradas
4. Activar/desactivar entradas (sin eliminar)
5. Reordenar entradas (drag & drop)
6. Exportar/importar catálogos (CSV, JSON)

### Validación en Frontend

```typescript
// utils/validation.ts
export async function validateCatalogValue(
  catalogType: string,
  code: string
): Promise<boolean> {
  const { data } = await supabase
    .from('catalogs')
    .select('code')
    .eq('catalog_type', catalogType)
    .eq('code', code)
    .eq('is_active', true)
    .single();
  
  return !!data;
}

// Uso en formularios con react-hook-form
{
  field: 'sector_code',
  rules: {
    validate: async (value) => {
      const isValid = await validateCatalogValue('company_sectors', value);
      return isValid || 'Sector inválido';
    }
  }
}
```

### Caché de Catálogos

```typescript
// lib/catalogCache.ts
class CatalogCache {
  private cache: Map<string, CatalogEntry[]> = new Map();
  private ttl = 5 * 60 * 1000; // 5 minutos

  async get(catalogType: string): Promise<CatalogEntry[]> {
    const cached = this.cache.get(catalogType);
    if (cached) return cached;

    const { data } = await supabase
      .from('catalogs')
      .select('*')
      .eq('catalog_type', catalogType)
      .eq('is_active', true)
      .order('display_order');

    if (data) {
      this.cache.set(catalogType, data);
      setTimeout(() => this.cache.delete(catalogType), this.ttl);
    }

    return data || [];
  }

  clear() {
    this.cache.clear();
  }
}

export const catalogCache = new CatalogCache();
```

### Versionado de Catálogos

Para entornos que requieran auditoría de cambios en catálogos:

```sql
CREATE TABLE public.catalog_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID REFERENCES catalogs(id),
  catalog_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  change_type TEXT CHECK (change_type IN ('create', 'update', 'delete', 'deactivate')),
  previous_data JSONB,
  new_data JSONB
);
```

## Referencias

- [Mapeo de Entidades](./MAPEO_ENTIDADES.md)
- [Decisiones de Duplicidades](./DECISIONES_DUPLICIDADES.md)
- [Glosario EN→ES para UI](./GLOSARIO_UI.md)
- [Modelo de Dominio Actual](./MODELO_DOMINIO.md)
