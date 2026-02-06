# Diagramas de Arquitectura del Esquema

## Índice
1. [Diagrama de Mapeo de Entidades](#diagrama-de-mapeo-de-entidades)
2. [Diagrama de Relaciones (Esquema Nuevo)](#diagrama-de-relaciones-esquema-nuevo)
3. [Flujo de Migración](#flujo-de-migración)
4. [Arquitectura de Catálogos](#arquitectura-de-catálogos)

## Diagrama de Mapeo de Entidades

Este diagrama muestra cómo las entidades actuales (español) se mapean a las nuevas entidades (inglés):

```mermaid
graph LR
    subgraph "Esquema Actual (ES)"
        E1[empresas]
        E2[contactos]
        E3[asesoramientos]
        E4[eventos]
        E5[formaciones]
        E6[evidencias]
        E7[colaboradores]
        E8[profiles]
        E9[user_roles]
    end
    
    subgraph "Esquema Propuesto (EN)"
        N1[companies]
        N2[company_contacts]
        N3[consultations]
        N4[events]
        N5[trainings]
        N6[attachments]
        N7[partner_entities]
        N8[user_profiles]
        N9[user_roles]
    end
    
    E1 -->|Renombrar| N1
    E2 -->|Renombrar| N2
    E3 -->|Renombrar| N3
    E4 -->|Renombrar| N4
    E5 -->|Renombrar| N5
    E6 -->|Renombrar| N6
    E7 -->|Renombrar| N7
    E8 -->|Renombrar| N8
    E9 -->|Mantener| N9
    
    style E1 fill:#ffebee
    style E2 fill:#ffebee
    style E3 fill:#ffebee
    style E4 fill:#ffebee
    style E5 fill:#ffebee
    style E6 fill:#ffebee
    style E7 fill:#ffebee
    style E8 fill:#ffebee
    style E9 fill:#e8f5e9
    
    style N1 fill:#e3f2fd
    style N2 fill:#e3f2fd
    style N3 fill:#e3f2fd
    style N4 fill:#e3f2fd
    style N5 fill:#e3f2fd
    style N6 fill:#e3f2fd
    style N7 fill:#e3f2fd
    style N8 fill:#e3f2fd
    style N9 fill:#e8f5e9
```

**Leyenda**:
- 🔴 Rojo: Entidades actuales (español)
- 🔵 Azul: Entidades nuevas (inglés) - Renombradas
- 🟢 Verde: Sin cambios

---

## Diagrama de Relaciones (Esquema Nuevo)

Este diagrama muestra las relaciones entre entidades en el nuevo esquema:

```mermaid
erDiagram
    users ||--o{ companies : "tecnico_asignado"
    users ||--o{ consultations : "consultant"
    users ||--o{ partner_entities : "assigned_to"
    users ||--o{ user_profiles : "has"
    users ||--o{ user_roles : "has"
    
    companies ||--o{ company_contacts : "has"
    companies ||--o{ consultations : "receives"
    companies ||--o{ attachments : "has"
    companies ||--o| events : "related"
    
    consultations ||--o{ attachments : "has"
    
    events ||--o{ attachments : "has"
    
    trainings ||--o{ attachments : "has"
    
    companies {
        uuid id PK
        text legal_name
        text trade_name
        text tax_id UK
        text sector_code FK
        text maturity_phase FK
        text status FK
        uuid assigned_technician_id FK
    }
    
    company_contacts {
        uuid id PK
        uuid company_id FK
        text full_name
        text position
        text email
        boolean is_primary
    }
    
    consultations {
        uuid id PK
        uuid company_id FK
        uuid consultant_id FK
        date date
        text status FK
        text topic
    }
    
    events {
        uuid id PK
        text name
        text type FK
        text status FK
        date date
        uuid company_id FK
    }
    
    trainings {
        uuid id PK
        text title
        text type FK
        text status FK
        date start_date
        date end_date
    }
    
    attachments {
        uuid id PK
        text title
        text type FK
        uuid company_id FK
        uuid event_id FK
        uuid training_id FK
        uuid consultation_id FK
    }
    
    partner_entities {
        uuid id PK
        text name
        text type FK
        text status FK
        uuid assigned_to FK
    }
    
    user_profiles {
        uuid id PK
        text email
        text full_name
    }
    
    user_roles {
        uuid id PK
        uuid user_id FK
        text role FK
    }
```

---

## Flujo de Migración

Este diagrama muestra el proceso de migración por fases:

```mermaid
graph TD
    A[Fase 1: Documentación] --> B[Fase 2: Catálogos]
    B --> C[Fase 3: Migración Schema]
    C --> D[Fase 4: Código Frontend]
    D --> E[Fase 5: Transición]
    E --> F[Fase 6: Limpieza]
    
    A1[Mapeo de entidades]
    A2[Decisiones duplicidades]
    A3[Glosario UI]
    A4[Inventario catálogos]
    
    A --> A1
    A --> A2
    A --> A3
    A --> A4
    
    B1[Crear tabla catalogs]
    B2[Poblar catálogos]
    B3[Componentes UI]
    
    B --> B1
    B1 --> B2
    B2 --> B3
    
    C1[Crear tablas nuevas]
    C2[Mantener tablas antiguas]
    C3[Script de migración]
    C4[Validar datos]
    
    C --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    
    D1[Actualizar types]
    D2[Actualizar queries]
    D3[Actualizar componentes]
    D4[Sistema i18n]
    
    D --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    
    E1[Crear vistas compatibilidad]
    E2[API dual]
    E3[Testing extensivo]
    
    E --> E1
    E1 --> E2
    E2 --> E3
    
    F1[Deprecar API antigua]
    F2[Eliminar vistas]
    F3[Eliminar tablas antiguas]
    F4[Actualizar docs]
    
    F --> F1
    F1 --> F2
    F2 --> F3
    F3 --> F4
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#fff9c4
    style D fill:#fff9c4
    style E fill:#f3e5f5
    style F fill:#f3e5f5
    
    style A1 fill:#e1f5fe
    style A2 fill:#e1f5fe
    style A3 fill:#e1f5fe
    style A4 fill:#e1f5fe
```

---

## Arquitectura de Catálogos

Este diagrama muestra la arquitectura del sistema de catálogos:

```mermaid
graph TB
    subgraph "Capa de Datos"
        DB[(PostgreSQL)]
        CATALOGS[Tabla: catalogs]
    end
    
    subgraph "Capa de API"
        API[Supabase API]
        RLS[Row Level Security]
    end
    
    subgraph "Capa de Lógica"
        CACHE[Catalog Cache]
        HOOK[useCatalog Hook]
        VALIDATOR[Validadores]
    end
    
    subgraph "Capa de UI"
        SELECT[CatalogSelect Component]
        ADMIN[Admin Panel]
        FORMS[Formularios]
    end
    
    DB --> CATALOGS
    CATALOGS --> API
    API --> RLS
    RLS --> CACHE
    CACHE --> HOOK
    HOOK --> SELECT
    HOOK --> VALIDATOR
    SELECT --> FORMS
    ADMIN --> API
    
    C1[company_sectors]
    C2[maturity_phases]
    C3[event_types]
    C4[training_types]
    C5[... 22 tipos total]
    
    CATALOGS --> C1
    CATALOGS --> C2
    CATALOGS --> C3
    CATALOGS --> C4
    CATALOGS --> C5
    
    style DB fill:#e8eaf6
    style CATALOGS fill:#c5cae9
    style API fill:#b39ddb
    style CACHE fill:#90caf9
    style HOOK fill:#81c784
    style SELECT fill:#aed581
    style ADMIN fill:#fff59d
    
    style C1 fill:#ffccbc
    style C2 fill:#ffccbc
    style C3 fill:#ffccbc
    style C4 fill:#ffccbc
    style C5 fill:#ffccbc
```

---

## Diagrama de Estados (Companies)

Flujo de estados de una empresa en el sistema:

```mermaid
stateDiagram-v2
    [*] --> Pendiente: Nueva empresa
    Pendiente --> EnProceso: Asignar técnico
    EnProceso --> Asesorada: Asesoramiento completado
    Asesorada --> Completada: Cierre exitoso
    
    EnProceso --> Pendiente: Reasignar
    Asesorada --> EnProceso: Más asesoramientos
    
    Pendiente --> [*]: Cierre (no cualificado)
    EnProceso --> [*]: Cierre (sin interés)
    Asesorada --> [*]: Cierre
    Completada --> [*]: Archivado
    
    note right of Pendiente
        Estado inicial
        Sin técnico asignado
    end note
    
    note right of EnProceso
        Técnico asignado
        Asesoramientos activos
    end note
    
    note right of Asesorada
        Objetivos cumplidos
        Esperando cierre
    end note
    
    note right of Completada
        Caso cerrado
        Documentado
    end note
```

---

## Diagrama de Prioridad de Catálogos

Visualización de la prioridad de implementación de catálogos:

```mermaid
graph LR
    subgraph "Alta Prioridad - Sprint 1"
        P1[company_sectors]
        P2[maturity_phases]
        P3[company_statuses]
        P4[consultation_statuses]
        P5[user_roles]
    end
    
    subgraph "Alta Prioridad - Sprint 2"
        P6[event_types]
        P7[event_statuses]
        P8[training_types]
        P9[training_statuses]
        P10[attachment_types]
        P11[partner_types]
    end
    
    subgraph "Media Prioridad - Sprint 3"
        M1[pipeline_statuses]
        M2[lead_sources]
        M3[legal_forms]
        M4[closure_reasons]
        M5[training_modalities]
    end
    
    subgraph "Media Prioridad - Sprint 4"
        M6[partner_statuses]
        M7[partnership_scopes]
        M8[support_types]
        M9[canary_islands]
    end
    
    subgraph "Baja Prioridad - Sprint 5"
        L1[ticket_ranges]
        L2[municipalities]
    end
    
    START([Inicio]) --> P1
    P1 & P2 & P3 & P4 & P5 --> P6
    P6 & P7 & P8 & P9 & P10 & P11 --> M1
    M1 & M2 & M3 & M4 & M5 --> M6
    M6 & M7 & M8 & M9 --> L1
    L1 & L2 --> END([Fin])
    
    style P1 fill:#ef5350
    style P2 fill:#ef5350
    style P3 fill:#ef5350
    style P4 fill:#ef5350
    style P5 fill:#ef5350
    style P6 fill:#ef5350
    style P7 fill:#ef5350
    style P8 fill:#ef5350
    style P9 fill:#ef5350
    style P10 fill:#ef5350
    style P11 fill:#ef5350
    
    style M1 fill:#ffa726
    style M2 fill:#ffa726
    style M3 fill:#ffa726
    style M4 fill:#ffa726
    style M5 fill:#ffa726
    style M6 fill:#ffa726
    style M7 fill:#ffa726
    style M8 fill:#ffa726
    style M9 fill:#ffa726
    
    style L1 fill:#66bb6a
    style L2 fill:#66bb6a
```

---

## Integración i18n

Flujo de traducción entre código y UI:

```mermaid
graph TD
    CODE[Código: companies.legal_name]
    
    I18N{Sistema i18n}
    
    LOCALE{Locale Actual}
    
    ES[es/companies.json]
    EN[en/companies.json]
    
    UI_ES[UI: 'Nombre Legal']
    UI_EN[UI: 'Legal Name']
    
    CODE --> I18N
    I18N --> LOCALE
    
    LOCALE -->|es| ES
    LOCALE -->|en| EN
    
    ES --> UI_ES
    EN --> UI_EN
    
    ES_JSON["
    {
      fields: {
        legal_name: {
          label: 'Nombre Legal',
          placeholder: 'Nombre completo...'
        }
      }
    }
    "]
    
    EN_JSON["
    {
      fields: {
        legal_name: {
          label: 'Legal Name',
          placeholder: 'Full legal name...'
        }
      }
    }
    "]
    
    ES --> ES_JSON
    EN --> EN_JSON
    
    style CODE fill:#e3f2fd
    style I18N fill:#fff9c4
    style ES fill:#ffccbc
    style EN fill:#c5e1a5
    style UI_ES fill:#ffccbc
    style UI_EN fill:#c5e1a5
```

---

## Notas de Uso

### Visualización de Diagramas Mermaid

Los diagramas en este documento usan la sintaxis de Mermaid. Para visualizarlos:

1. **GitHub**: Se renderizan automáticamente en archivos `.md`
2. **VS Code**: Instalar extensión "Markdown Preview Mermaid Support"
3. **Online**: Usar [Mermaid Live Editor](https://mermaid.live)

### Actualización de Diagramas

Al modificar el esquema o las decisiones, actualizar los diagramas correspondientes:

1. Editar el código Mermaid en este archivo
2. Validar en Mermaid Live Editor
3. Verificar que se renderiza correctamente
4. Commit con mensaje descriptivo

## Referencias

- [Mapeo de Entidades](./MAPEO_ENTIDADES.md)
- [Decisiones de Duplicidades](./DECISIONES_DUPLICIDADES.md)
- [Glosario UI](./GLOSARIO_UI.md)
- [Inventario de Catálogos](./INVENTARIO_CATALOGOS.md)
- [README Fundacional](./README_FUNDACIONAL.md)
