# Modelo de Dominio - Impulsa LOV

## Índice
1. [Introducción](#introducción)
2. [Entidades del Sistema](#entidades-del-sistema)
3. [Relaciones entre Entidades](#relaciones-entre-entidades)
4. [Dependencias](#dependencias)
5. [Diagrama de Entidad-Relación](#diagrama-de-entidad-relación)

## Introducción

Este documento define el modelo de dominio del sistema Impulsa LOV, una aplicación para la gestión de asesoramientos, contactos, empresas, eventos, formaciones, evidencias y colaboradores. El modelo se basa en el esquema de base de datos PostgreSQL implementado en Supabase.

## Entidades del Sistema

### 1. Empresa

**Descripción**: Representa una empresa o entidad que participa en el programa de asesoramiento.

**Campos principales**:
- `id` (UUID): Identificador único
- `nombre` (TEXT): Nombre legal de la empresa
- `nombre_comercial` (TEXT): Nombre comercial
- `cif` (TEXT): Identificación fiscal (único)
- `sector` (ENUM): Sector de actividad (tecnologia, industria, servicios, comercio, turismo, energia, construccion, agroalimentario, otro)
- `subsector` (TEXT): Subsector específico
- `fase_madurez` (ENUM): Fase de madurez (idea, validacion, crecimiento, consolidacion)
- `estado` (ENUM): Estado del proceso (pendiente, en_proceso, asesorada, completada)
- `forma_juridica` (TEXT): Forma jurídica (S.L., S.A., Autónomo, etc.)

**Campos de ubicación**:
- `direccion` (TEXT): Dirección física
- `codigo_postal` (TEXT): Código postal
- `municipio` (TEXT): Municipio
- `isla` (TEXT): Isla (específico para Canarias)

**Campos de contacto**:
- `telefono` (TEXT): Teléfono de contacto
- `email` (TEXT): Correo electrónico
- `web` (TEXT): Sitio web
- `redes_sociales` (JSONB): Enlaces a redes sociales
- `contacto_principal` (TEXT): Nombre del contacto principal

**Campos de seguimiento**:
- `fecha_constitucion` (DATE): Fecha de constitución
- `codigo_estado_pipeline` (TEXT): Estado en el pipeline de ventas
- `codigo_origen_lead` (TEXT): Origen del lead
- `tecnico_asignado_id` (UUID): Técnico asignado (FK a users)

**Campos de diagnóstico**:
- `url_formulario_diagnostico` (TEXT): URL del formulario de diagnóstico
- `fecha_recepcion_diagnostico` (DATE): Fecha de recepción del diagnóstico
- `resumen_diagnostico` (TEXT): Resumen del diagnóstico

**Campos de gestión**:
- `fecha_inicio` (DATE): Fecha de inicio del proyecto
- `fecha_finalizacion` (DATE): Fecha de finalización
- `codigo_motivo_cierre` (TEXT): Motivo de cierre
- `es_caso_exito` (BOOLEAN): Indicador de caso de éxito
- `descripcion` (TEXT): Descripción general

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 2. Contacto

**Descripción**: Representa una persona de contacto dentro de una empresa.

**Campos principales**:
- `id` (UUID): Identificador único
- `empresa_id` (UUID): Empresa a la que pertenece (FK a empresas)
- `nombre` (TEXT): Nombre completo
- `cargo` (TEXT): Cargo o posición
- `email` (TEXT): Correo electrónico
- `telefono` (TEXT): Teléfono
- `es_principal` (BOOLEAN): Indica si es el contacto principal
- `notas` (TEXT): Notas adicionales

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 3. Asesoramiento

**Descripción**: Representa una sesión de asesoramiento con una empresa.

**Campos principales**:
- `id` (UUID): Identificador único
- `empresa_id` (UUID): Empresa asesorada (FK a empresas)
- `tecnico_id` (UUID): Técnico que realiza el asesoramiento (FK a users)
- `fecha` (DATE): Fecha del asesoramiento
- `hora_inicio` (TIME): Hora de inicio
- `duracion_minutos` (INTEGER): Duración en minutos (por defecto 60)
- `estado` (ENUM): Estado (programado, en_curso, completado, cancelado)
- `tema` (TEXT): Tema del asesoramiento

**Campos de seguimiento**:
- `acta` (TEXT): Acta de la reunión
- `compromisos` (TEXT): Compromisos acordados
- `proximos_pasos` (TEXT): Próximos pasos
- `informe_generado` (BOOLEAN): Indica si se generó informe

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 4. Evento

**Descripción**: Representa un evento organizado (talleres, seminarios, networking, etc.).

**Campos principales**:
- `id` (UUID): Identificador único
- `nombre` (TEXT): Nombre del evento
- `tipo` (ENUM): Tipo de evento (taller, seminario, networking, conferencia, presentacion, otro)
- `estado` (ENUM): Estado (planificado, confirmado, en_curso, completado, cancelado)
- `fecha` (DATE): Fecha del evento
- `hora_inicio` (TIME): Hora de inicio
- `duracion_minutos` (INTEGER): Duración en minutos (por defecto 120)
- `ubicacion` (TEXT): Ubicación del evento

**Campos descriptivos**:
- `descripcion` (TEXT): Descripción del evento
- `ponentes` (TEXT): Ponentes/facilitadores
- `observaciones` (TEXT): Observaciones adicionales

**Campos de participación**:
- `asistentes_esperados` (INTEGER): Número esperado de asistentes
- `asistentes_confirmados` (INTEGER): Asistentes confirmados

**Relaciones**:
- `empresa_id` (UUID): Empresa relacionada (FK a empresas, opcional)

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 5. Formación

**Descripción**: Representa una actividad formativa (píldoras formativas, cursos, webinars, etc.).

**Campos principales**:
- `id` (UUID): Identificador único
- `titulo` (TEXT): Título de la formación
- `tipo` (ENUM): Tipo (pildora_formativa, curso, masterclass, webinar, otro)
- `estado` (ENUM): Estado (planificada, en_curso, completada, cancelada)
- `fecha_inicio` (DATE): Fecha de inicio
- `fecha_fin` (DATE): Fecha de finalización
- `duracion_horas` (INTEGER): Duración en horas
- `formador` (TEXT): Formador/instructor

**Campos descriptivos**:
- `descripcion` (TEXT): Descripción
- `objetivos` (TEXT): Objetivos de aprendizaje
- `contenido` (TEXT): Contenido del programa
- `materiales` (TEXT): Materiales didácticos
- `observaciones` (TEXT): Observaciones adicionales

**Campos de participación**:
- `participantes_max` (INTEGER): Número máximo de participantes
- `participantes_inscritos` (INTEGER): Participantes inscritos

**Campos de modalidad**:
- `modalidad` (TEXT): Modalidad (presencial, online, hibrida)
- `ubicacion` (TEXT): Ubicación (si es presencial)

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 6. Evidencia

**Descripción**: Representa una evidencia documental del trabajo realizado (informes, actas, fotografías, videos, certificados, etc.).

**Campos principales**:
- `id` (UUID): Identificador único
- `titulo` (TEXT): Título de la evidencia
- `tipo` (ENUM): Tipo (informe, acta, fotografia, video, certificado, documento, otro)
- `descripcion` (TEXT): Descripción
- `fecha` (DATE): Fecha de la evidencia
- `archivo_url` (TEXT): URL del archivo
- `archivo_nombre` (TEXT): Nombre del archivo
- `observaciones` (TEXT): Observaciones adicionales

**Relaciones** (todas opcionales, una evidencia puede relacionarse con una o más entidades):
- `empresa_id` (UUID): Empresa relacionada (FK a empresas)
- `evento_id` (UUID): Evento relacionado (FK a eventos)
- `formacion_id` (UUID): Formación relacionada (FK a formaciones)
- `asesoramiento_id` (UUID): Asesoramiento relacionado (FK a asesoramientos)

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 7. Colaborador

**Descripción**: Representa una entidad colaboradora externa (entidades públicas, privadas, asociaciones, universidades, centros de investigación, etc.).

**Campos principales**:
- `id` (UUID): Identificador único
- `nombre` (TEXT): Nombre de la entidad
- `tipo` (ENUM): Tipo (entidad_publica, entidad_privada, asociacion, universidad, centro_investigacion, otro)
- `estado` (ENUM): Estado de la relación (activo, inactivo, pendiente)
- `cif` (TEXT): Identificación fiscal
- `descripcion` (TEXT): Descripción de la entidad

**Campos de ubicación**:
- `direccion` (TEXT): Dirección física
- `telefono` (TEXT): Teléfono
- `email` (TEXT): Correo electrónico
- `web` (TEXT): Sitio web

**Campos de contacto**:
- `contacto_principal` (TEXT): Nombre del contacto
- `cargo_contacto` (TEXT): Cargo del contacto
- `email_contacto` (TEXT): Email del contacto
- `telefono_contacto` (TEXT): Teléfono del contacto

**Campos de colaboración**:
- `fecha_inicio_colaboracion` (DATE): Fecha de primer contacto
- `ambito_colaboracion` (TEXT): Ámbito de colaboración
- `convenio_firmado` (BOOLEAN): Indica si hay convenio firmado
- `codigo_alcance` (TEXT): Código de alcance (local, regional, nacional)
- `sectores_interes` (TEXT[]): Sectores de interés
- `tipos_apoyo` (TEXT[]): Tipos de apoyo que ofrece
- `codigo_rango_ticket` (TEXT): Rango de ticket
- `requisitos_habituales` (TEXT): Requisitos habituales
- `asignado_a` (UUID): Usuario asignado (FK a users)
- `observaciones` (TEXT): Observaciones adicionales

**Metadatos**:
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 8. Profile (Usuario)

**Descripción**: Perfil de usuario del sistema (basado en auth.users de Supabase).

**Campos principales**:
- `id` (UUID): Identificador único (FK a auth.users)
- `email` (TEXT): Correo electrónico
- `full_name` (TEXT): Nombre completo
- `avatar_url` (TEXT): URL del avatar

**Metadatos**:
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### 9. User Role (Rol de Usuario)

**Descripción**: Roles asignados a los usuarios del sistema.

**Campos principales**:
- `id` (UUID): Identificador único
- `user_id` (UUID): Usuario (FK a auth.users)
- `role` (ENUM): Rol (admin, tecnico)

**Metadatos**:
- `created_at` (TIMESTAMP): Fecha de creación

**Constraint**: Un usuario puede tener múltiples roles, pero la combinación (user_id, role) es única.

## Relaciones entre Entidades

### Relaciones Directas

#### Empresa → Contacto (1:N)
- Una empresa puede tener múltiples contactos
- Un contacto pertenece a una única empresa
- Cascada: Al eliminar una empresa, se eliminan sus contactos (ON DELETE CASCADE)

#### Empresa → Asesoramiento (1:N)
- Una empresa puede tener múltiples asesoramientos
- Un asesoramiento pertenece a una única empresa
- Cascada: Al eliminar una empresa, se eliminan sus asesoramientos (ON DELETE CASCADE)

#### Usuario → Empresa (1:N - técnico asignado)
- Un técnico puede estar asignado a múltiples empresas
- Una empresa tiene un único técnico asignado (opcional)
- Cascada: Al eliminar un usuario, el campo técnico_asignado_id se establece a NULL

#### Usuario → Asesoramiento (1:N)
- Un técnico puede realizar múltiples asesoramientos
- Un asesoramiento es realizado por un único técnico

#### Empresa → Evento (1:N - opcional)
- Un evento puede estar relacionado con una empresa (opcional)
- Una empresa puede tener múltiples eventos relacionados
- Cascada: Al eliminar una empresa, el campo empresa_id se establece a NULL

#### Evidencia → Empresa (N:1 - opcional)
- Una evidencia puede estar relacionada con una empresa
- Una empresa puede tener múltiples evidencias

#### Evidencia → Evento (N:1 - opcional)
- Una evidencia puede estar relacionada con un evento
- Un evento puede tener múltiples evidencias

#### Evidencia → Formación (N:1 - opcional)
- Una evidencia puede estar relacionada con una formación
- Una formación puede tener múltiples evidencias

#### Evidencia → Asesoramiento (N:1 - opcional)
- Una evidencia puede estar relacionada con un asesoramiento
- Un asesoramiento puede tener múltiples evidencias

#### Usuario → Colaborador (1:N - asignado a)
- Un colaborador puede estar asignado a un usuario
- Un usuario puede tener múltiples colaboradores asignados
- Cascada: Al eliminar un usuario, el campo asignado_a se establece a NULL

### Relaciones de Auditoría

Todas las entidades principales tienen un campo `created_by` que referencia al usuario que creó el registro:

- Usuario → Empresa (created_by)
- Usuario → Contacto (created_by)
- Usuario → Asesoramiento (created_by)
- Usuario → Evento (created_by)
- Usuario → Formación (created_by)
- Usuario → Evidencia (created_by)
- Usuario → Colaborador (created_by)

## Dependencias

### Dependencias Obligatorias

1. **Contacto**: Requiere obligatoriamente una Empresa existente
2. **Asesoramiento**: Requiere obligatoriamente:
   - Una Empresa existente
   - Un Usuario (técnico) existente

### Dependencias Opcionales

1. **Evidencia**: Puede relacionarse opcionalmente con:
   - Una Empresa
   - Un Evento
   - Una Formación
   - Un Asesoramiento

2. **Evento**: Puede relacionarse opcionalmente con una Empresa

3. **Empresa**: Puede tener opcionalmente un técnico asignado

4. **Colaborador**: Puede tener opcionalmente un usuario asignado

### Dependencias de Creación de Usuario

Cuando se crea un usuario en auth.users:
1. Se crea automáticamente un registro en `profiles` (trigger `on_auth_user_created`)
2. Se asigna automáticamente el rol 'tecnico' en `user_roles`

## Diagrama de Entidad-Relación

```
┌─────────────────┐
│     Usuario     │
│   (profiles)    │
└────────┬────────┘
         │
         │ created_by (N:1)
         ├──────────────────────────────────────┐
         │                                       │
         │ tecnico_asignado_id (1:N)            │
         ├──────────┐                            │
         │          │                            │
         │          ▼                            │
         │   ┌─────────────────┐                │
         │   │    Empresa      │                │
         │   └────────┬────────┘                │
         │            │                          │
         │            │ (1:N)                    │
         │            ├──────────────┐           │
         │            │              │           │
         │            ▼              ▼           │
         │   ┌──────────────┐  ┌──────────────┐ │
         │   │   Contacto   │  │Asesoramiento │ │
         │   └──────────────┘  └──────┬───────┘ │
         │                             │         │
         │ tecnico_id (N:1)           │         │
         └─────────────────────────────┘         │
                                                 │
         ┌───────────────────────────────────────┘
         │
         │ created_by (N:1)
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
  ┌──────────┐   ┌──────────┐  ┌─────────────┐ ┌──────────────┐
  │  Evento  │   │Formación │  │ Colaborador │ │  Evidencia   │
  └────┬─────┘   └────┬─────┘  └──────────────┘ └──────┬───────┘
       │              │                                  │
       │              │                                  │
       │ empresa_id   │                                  │ (N:1 opcional)
       │ (N:1 opt)    │                                  ├─► empresa_id
       │              │                                  ├─► evento_id
       └──────────────┴──────────────────────────────────┼─► formacion_id
                                                         └─► asesoramiento_id

┌──────────────────┐
│   User Roles     │
│  (user_roles)    │
└──────────────────┘
        │
        │ user_id (N:1)
        │
        ▼
┌──────────────────┐
│     Usuario      │
│  (auth.users)    │
└──────────────────┘
```

### Leyenda

- `(1:N)`: Relación uno a muchos
- `(N:1)`: Relación muchos a uno
- `(N:1 opt)`: Relación muchos a uno opcional
- `created_by`: Campo de auditoría que registra quién creó el registro
- `FK`: Foreign Key (Clave foránea)
- `CASCADE`: Eliminación en cascada
- `SET NULL`: Establecer a NULL al eliminar el registro relacionado

## Notas Importantes

1. **Row Level Security (RLS)**: Todas las tablas tienen habilitado RLS para controlar el acceso a los datos según el rol del usuario.

2. **Triggers**: Todas las entidades principales tienen un trigger `update_updated_at` que actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

3. **Valores por defecto**: Muchos campos tienen valores por defecto definidos (por ejemplo, `estado`, `es_principal`, `informe_generado`, etc.).

4. **Tipos ENUM**: El sistema usa tipos ENUM de PostgreSQL para campos con valores predefinidos, garantizando la integridad de los datos.

5. **Arrays**: Algunos campos como `sectores_interes` y `tipos_apoyo` usan arrays de PostgreSQL para almacenar múltiples valores.

6. **JSONB**: El campo `redes_sociales` usa JSONB para flexibilidad en el almacenamiento de múltiples redes sociales.

7. **Unicidad**: Algunos campos tienen constraints de unicidad (por ejemplo, `cif` en empresas, combinación `user_id + role` en user_roles).

8. **Cascadas de eliminación**: Las relaciones críticas tienen definidas políticas de cascada (CASCADE o SET NULL) para mantener la integridad referencial.
