# Decisiones sobre Duplicidades Conceptuales

## Índice
1. [Introducción](#introducción)
2. [Análisis de Duplicidades](#análisis-de-duplicidades)
3. [Decisiones por Caso](#decisiones-por-caso)
4. [Matriz de Comparación](#matriz-de-comparación)
5. [Recomendaciones de Implementación](#recomendaciones-de-implementación)

## Introducción

Este documento analiza y resuelve las duplicidades conceptuales identificadas en el sistema Impulsa LOV durante el proceso de diseño del nuevo esquema. El objetivo es eliminar ambigüedades, consolidar conceptos redundantes y establecer definiciones claras para cada entidad.

### Metodología

Para cada caso de duplicidad potencial, se analiza:
1. **Propósito**: ¿Qué representa cada concepto?
2. **Alcance**: ¿Qué información almacena?
3. **Relaciones**: ¿Cómo se conecta con otras entidades?
4. **Uso**: ¿Cómo se utiliza en el sistema?
5. **Decisión**: ¿Se mantienen separados, se consolidan o se descarta uno?

## Análisis de Duplicidades

### 1. Colaboradores vs. Entities

#### Contexto
En el esquema actual existe la entidad `colaboradores` que podría parecer duplicar el concepto de "entidades" en un sentido más amplio.

#### Análisis

**Colaboradores (Partner Entities)**:
- **Propósito**: Representar organizaciones externas que colaboran con el programa
- **Tipos**: Entidades públicas, privadas, asociaciones, universidades, centros de investigación
- **Relación con empresas**: Los colaboradores NO son empresas del programa, son socios externos
- **Ejemplo**: Una universidad que ofrece formación, un banco que ofrece financiación

**Empresas (Companies)**:
- **Propósito**: Representar las empresas/startups que reciben el asesoramiento
- **Tipos**: Empresas en diferentes fases de madurez (idea, validación, crecimiento, consolidación)
- **Relación con programa**: Son los beneficiarios directos del programa
- **Ejemplo**: Una startup tecnológica que busca asesoramiento

#### Decisión: **MANTENER SEPARADOS**

**Justificación**:
1. **Roles diferentes**: Los colaboradores son proveedores de recursos/servicios; las empresas son receptoras
2. **Ciclos de vida diferentes**: Las empresas tienen un pipeline de asesoramiento; los colaboradores tienen un estado de colaboración
3. **Información diferente**: Las empresas requieren diagnósticos, fases de madurez, etc.; los colaboradores requieren convenios, tipos de apoyo, etc.
4. **Relaciones diferentes**: Las empresas se relacionan con asesoramientos, contactos, evidencias; los colaboradores tienen su propio conjunto de relaciones

**Nomenclatura Final**:
- `colaboradores` → `partner_entities` (organizaciones colaboradoras)
- `empresas` → `companies` (empresas beneficiarias)

---

### 2. Evidencias vs. Attachments

#### Contexto
El término "evidencias" podría parecer limitado solo a pruebas legales, mientras que "attachments" es más genérico para archivos adjuntos.

#### Análisis

**Evidencias (concepto actual)**:
- **Propósito**: Documentar el trabajo realizado (informes, actas, fotos, vídeos, certificados)
- **Uso legal**: Sí, pero no exclusivamente
- **Alcance**: Cualquier tipo de documento relacionado con actividades del programa
- **Relaciones**: Pueden vincularse a empresas, eventos, formaciones, asesoramientos

**Attachments (concepto propuesto)**:
- **Propósito**: Archivos adjuntos a diferentes entidades del sistema
- **Uso legal**: No necesariamente
- **Alcance**: Más amplio, incluye cualquier tipo de archivo
- **Relaciones**: Mismo modelo de relaciones flexibles

#### Decisión: **RENOMBRAR (Evidencias → Attachments)**

**Justificación**:
1. **Universalidad**: "Attachments" es más comprensible internacionalmente
2. **Flexibilidad**: Permite adjuntar cualquier tipo de archivo sin connotación legal estricta
3. **Ampliación de uso**: Facilita añadir adjuntos que no sean necesariamente "evidencia"
4. **Estándar técnico**: Es el término estándar en aplicaciones web/móviles

**Impacto**:
- Cambio de nombre de tabla: `evidencias` → `attachments`
- Mantener los mismos tipos: informe, acta, fotografía, vídeo, certificado, documento, otro
- Mantener las mismas relaciones polimórficas con otras entidades

**Mitigación**:
- En la UI en español, se puede seguir usando "Evidencias" como etiqueta
- El glosario EN→ES documentará: `attachments` = "Evidencias/Adjuntos"

---

### 3. Contactos vs. Company Contacts vs. Contact Details

#### Contexto
Posible confusión entre contactos de empresas y información de contacto general.

#### Análisis

**Contactos (entidad actual)**:
- **Propósito**: Personas de contacto dentro de empresas
- **Tipo**: Entidad completa con nombre, cargo, email, teléfono, notas
- **Relación**: Exclusivamente asociados a una empresa

**Contact Details (información de contacto)**:
- **Propósito**: Campos de contacto (email, teléfono) dentro de otras entidades
- **Tipo**: Atributos, no entidad independiente
- **Ejemplos**: `empresas.email`, `colaboradores.telefono`

#### Decisión: **MANTENER SEPARADOS CON NOMENCLATURA CLARA**

**Justificación**:
1. **Naturaleza diferente**: Una es entidad (persona), otros son atributos (datos)
2. **Propósitos diferentes**: Los contactos tienen roles y relaciones; los contact details son solo datos
3. **Gestión diferente**: Los contactos tienen su propio CRUD; los contact details se editan con la entidad padre

**Nomenclatura Final**:
- Entidad: `contactos` → `company_contacts` (personas de contacto en empresas)
- Atributos: `email`, `telefono`, etc. (sin cambio, son campos simples)

**Convención**:
- Siempre que exista una tabla de contactos, llamarla `[entity]_contacts`
- Los campos de contacto simples se mantienen como `email`, `phone`, etc.

---

### 4. Usuarios vs. Profiles vs. Técnicos

#### Contexto
Posible confusión entre usuarios del sistema, perfiles de usuario y técnicos asignados.

#### Análisis

**auth.users (tabla de Supabase)**:
- **Propósito**: Autenticación y autorización
- **Gestión**: Manejada por Supabase Auth
- **Información**: Email, contraseña cifrada, tokens

**profiles (tabla de aplicación)**:
- **Propósito**: Información de perfil de usuario
- **Gestión**: Manejada por la aplicación
- **Información**: Nombre completo, avatar, preferencias

**user_roles (tabla de aplicación)**:
- **Propósito**: Roles asignados a usuarios
- **Tipos**: admin, tecnico
- **Gestión**: Control de acceso basado en roles (RBAC)

**Técnicos (concepto de negocio)**:
- **Propósito**: Usuarios con rol de técnico que asesoran empresas
- **Realidad**: Son usuarios con `role = 'tecnico'` en user_roles
- **Relaciones**: Asignados a empresas, realizan asesoramientos

#### Decisión: **MANTENER ARQUITECTURA ACTUAL**

**Justificación**:
1. **Separación de responsabilidades**: Auth (Supabase) vs. Perfil (App) vs. Roles (RBAC)
2. **Patrón estándar**: Es el patrón recomendado por Supabase
3. **Flexibilidad**: Permite múltiples roles por usuario
4. **Escalabilidad**: Facilita añadir más roles en el futuro

**Nomenclatura Final**:
- `auth.users` → sin cambio (gestionado por Supabase)
- `profiles` → `user_profiles` (mayor claridad)
- `user_roles` → sin cambio (ya claro)

**Convención**:
- "Técnico" es un concepto de negocio, no una entidad separada
- Los técnicos son usuarios con `role = 'tecnico'`
- Las referencias en otras tablas usan `assigned_technician_id` que apunta a `auth.users.id`

---

### 5. Estado (Status) en Múltiples Entidades

#### Contexto
Varias entidades tienen un campo `estado` con diferentes valores posibles.

#### Análisis

**Empresas.estado**:
- Valores: pendiente, en_proceso, asesorada, completada
- Representa: Progreso en el proceso de asesoramiento

**Asesoramientos.estado**:
- Valores: programado, en_curso, completado, cancelado
- Representa: Estado de una sesión específica

**Eventos.estado**:
- Valores: planificado, confirmado, en_curso, completado, cancelado
- Representa: Estado de organización del evento

**Formaciones.estado**:
- Valores: planificada, en_curso, completada, cancelada
- Representa: Estado de la actividad formativa

**Colaboradores.estado**:
- Valores: activo, inactivo, pendiente
- Representa: Estado de la relación de colaboración

#### Decisión: **MANTENER SEPARADOS CON ENUMS ESPECÍFICOS**

**Justificación**:
1. **Contextos diferentes**: Cada entidad tiene su propio ciclo de vida
2. **Valores diferentes**: Los estados válidos varían según la entidad
3. **Validación de datos**: Los ENUMs garantizan valores correctos
4. **Claridad semántica**: No tiene sentido que una empresa esté "cancelada" o un evento esté "asesorado"

**Nomenclatura Final**:
- Todas se llaman `status` en inglés
- Cada una tiene su propio ENUM type:
  - `company_status_enum`
  - `consultation_status_enum`
  - `event_status_enum`
  - `training_status_enum`
  - `partner_status_enum`

**Convención**:
- El campo siempre se llama `status`
- El tipo ENUM se nombra como `[entity]_status_enum`
- Los valores del ENUM son específicos del contexto de cada entidad

---

### 6. Tipo (Type) en Múltiples Entidades

#### Contexto
Similar al caso de "estado", varias entidades tienen un campo `tipo`.

#### Análisis

**Eventos.tipo**:
- Valores: taller, seminario, networking, conferencia, presentacion, otro
- Representa: Tipo de evento

**Formaciones.tipo**:
- Valores: pildora_formativa, curso, masterclass, webinar, otro
- Representa: Tipo de formación

**Evidencias.tipo**:
- Valores: informe, acta, fotografia, video, certificado, documento, otro
- Representa: Tipo de archivo/evidencia

**Colaboradores.tipo**:
- Valores: entidad_publica, entidad_privada, asociacion, universidad, centro_investigacion, otro
- Representa: Tipo de organización

#### Decisión: **MANTENER SEPARADOS CON ENUMS ESPECÍFICOS**

**Justificación**: Idéntica al caso de "estado"

**Nomenclatura Final**:
- Todas se llaman `type` en inglés
- Cada una tiene su propio ENUM type:
  - `event_type_enum`
  - `training_type_enum`
  - `attachment_type_enum`
  - `partner_type_enum`

---

### 7. Fechas: created_at vs. fecha vs. fecha_inicio

#### Contexto
Múltiples campos de fecha con diferentes propósitos.

#### Análisis

**created_at / updated_at (auditoría)**:
- **Propósito**: Registro automático de cuándo se creó/modificó
- **Tipo**: TIMESTAMP (con hora exacta)
- **Gestión**: Automática (triggers)
- **Presente en**: Todas las entidades

**fecha (fecha de negocio)**:
- **Propósito**: Fecha del evento de negocio (asesoramiento, evento)
- **Tipo**: DATE (solo fecha, sin hora)
- **Gestión**: Manual (usuario define)
- **Presente en**: asesoramientos, eventos, evidencias

**fecha_inicio / fecha_fin (periodo)**:
- **Propósito**: Periodo de duración de una actividad
- **Tipo**: DATE
- **Gestión**: Manual
- **Presente en**: formaciones, empresas (proyecto)

**fecha_constitucion, fecha_recepcion_diagnostico, etc. (fechas específicas)**:
- **Propósito**: Fechas específicas del dominio
- **Tipo**: DATE
- **Gestión**: Manual
- **Presente en**: Varias entidades según contexto

#### Decisión: **MANTENER CONVENCIONES CLARAS**

**Justificación**:
1. **Propósitos diferentes**: Auditoría vs. datos de negocio
2. **Tipos diferentes**: TIMESTAMP vs. DATE
3. **Gestión diferente**: Automática vs. manual

**Nomenclatura Final**:
- Auditoría: `created_at`, `updated_at` (TIMESTAMP, automático)
- Fecha simple: `date` (DATE, manual)
- Periodos: `start_date`, `end_date` (DATE, manual)
- Fechas específicas: `[purpose]_date` (ej: `incorporation_date`, `diagnostic_received_date`)

**Convención**:
- Todas las fechas de auditoría terminan en `_at`
- Todas las fechas de negocio terminan en `_date`
- Los periodos siempre son `start_date` + `end_date`

---

## Matriz de Comparación

| Caso | Entidad/Campo A | Entidad/Campo B | Decisión | Razón Principal |
|------|----------------|-----------------|----------|-----------------|
| 1 | Colaboradores | Empresas | Separados | Roles diferentes (proveedor vs. beneficiario) |
| 2 | Evidencias | - | Renombrar a Attachments | Mayor universalidad |
| 3 | Contactos (entidad) | Contact details (campos) | Separados | Naturaleza diferente (entidad vs. atributo) |
| 4 | Usuarios | Profiles | Separados | Separación auth/perfil |
| 5 | Estado (múltiples) | - | ENUMs específicos | Contextos diferentes |
| 6 | Tipo (múltiples) | - | ENUMs específicos | Contextos diferentes |
| 7 | created_at | fecha | Separados | Auditoría vs. negocio |

## Recomendaciones de Implementación

### 1. Convenciones de Nomenclatura

#### Entidades
- Plural en inglés para nombres de tabla: `companies`, `events`, `trainings`
- Snake_case para nombres compuestos: `company_contacts`, `partner_entities`

#### Campos
- Snake_case para todos los campos: `legal_name`, `start_date`
- Sufijos consistentes:
  - `_id` para claves foráneas
  - `_date` para fechas de negocio
  - `_at` para timestamps de auditoría
  - `_code` para códigos/enumeraciones
  - `_url` para URLs

#### ENUMs
- Sufijo `_enum` para tipos enumerados: `company_status_enum`
- Valores en snake_case: `in_progress`, `completed`

### 2. Relaciones

#### Foreign Keys
- Nombrar con claridad: `company_id`, `assigned_technician_id`
- Especificar ON DELETE behavior apropiado:
  - `CASCADE` para relaciones dependientes fuertes (ej: contactos de empresa)
  - `SET NULL` para relaciones opcionales (ej: técnico asignado)
  - `RESTRICT` para prevenir eliminaciones accidentales

#### Polimórficas
- Las evidencias/attachments mantienen múltiples FKs opcionales
- Todas las FKs son nullable
- Se puede adjuntar a una o más entidades simultáneamente

### 3. Tipos de Datos

| Concepto | Tipo PostgreSQL | Tipo TypeScript |
|----------|----------------|-----------------|
| IDs | UUID | string |
| Textos cortos | TEXT | string |
| Textos largos | TEXT | string |
| Fechas | DATE | string (ISO 8601) |
| Timestamps | TIMESTAMP WITH TIME ZONE | string (ISO 8601) |
| Booleanos | BOOLEAN | boolean |
| Números enteros | INTEGER | number |
| Arrays | TEXT[] | string[] |
| JSON | JSONB | object |
| Enumeraciones | ENUM | union type |

### 4. Índices

Campos candidatos para índices:
- Todas las foreign keys
- Campos de búsqueda frecuente: `legal_name`, `tax_id`, `email`
- Campos de filtrado: `status`, `type`, `sector_code`
- Campos de ordenamiento: `created_at`, `date`, `start_date`

### 5. Validaciones

#### A nivel de base de datos
- NOT NULL para campos obligatorios
- UNIQUE para campos que deben ser únicos (ej: `tax_id`)
- CHECK constraints para validaciones simples
- ENUMs para valores controlados

#### A nivel de aplicación
- Validación de formatos (email, teléfono, URL)
- Validación de rangos (fechas, números)
- Validación de relaciones (empresa existe antes de crear contacto)
- Validación de reglas de negocio complejas

### 6. Migración

**Estrategia recomendada**:

1. **Fase 1 - Preparación**:
   - Crear nuevas tablas con nomenclatura inglesa
   - Mantener tablas antiguas

2. **Fase 2 - Migración de datos**:
   - Script de migración que copie datos de tablas antiguas a nuevas
   - Validar integridad de datos

3. **Fase 3 - Actualización de código**:
   - Actualizar TypeScript types
   - Actualizar consultas y mutations
   - Actualizar componentes UI

4. **Fase 4 - Transición**:
   - Crear vistas con nombres antiguos apuntando a nuevas tablas
   - Período de convivencia de ambas APIs

5. **Fase 5 - Finalización**:
   - Eliminar vistas antiguas
   - Eliminar tablas antiguas
   - Actualizar documentación

## Conclusiones

1. **No existen duplicidades reales**: Los casos analizados son diferenciaciones legítimas
2. **Nomenclatura clara previene confusión**: El renombrado a inglés con nombres específicos (ej: `partner_entities` vs `companies`) elimina ambigüedades
3. **ENUMs específicos por contexto**: Cada entidad mantiene sus propios ENUMs para `status` y `type`
4. **Separación de responsabilidades**: Auth, perfiles y roles se mantienen separados siguiendo best practices
5. **Convenciones consistentes**: Las reglas de nomenclatura aplicadas consistentemente facilitan el mantenimiento

## Referencias

- [Mapeo de Entidades](./MAPEO_ENTIDADES.md)
- [Glosario EN→ES para UI](./GLOSARIO_UI.md)
- [Inventario de Catálogos](./INVENTARIO_CATALOGOS.md)
- [Modelo de Dominio Actual](./MODELO_DOMINIO.md)
